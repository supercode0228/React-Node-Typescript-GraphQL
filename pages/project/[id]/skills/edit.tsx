import { withApollo } from '../../../../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useMutation, useQuery, useApolloClient } from '@apollo/react-hooks';
import ReactTagInput from '@pathofdev/react-tag-input';
import { useDebouncedCallback } from 'use-debounce';
import classNames from 'classnames';
import { ToastContainer, toast, Slide } from 'react-toastify';

import '../../../app.scss';
import {
  BubbleSkillsDisplay,
  Card,
  DisplayText,
  Grid,
  Header,
  HelpButton,
  Input,
  Layout,
  Page,
  Stack,
  Subheading,
  TeamSkillsDisplay,
  Tabs,
  TopBar
} from '../../../../client/components';
import {
  ProjectInfo,
  UserInfo,
  ResolvedUserSkill,
  ProjectMemberInfo,
  ResolvedAggregatedSkill,
  TeamInfo,
  UserAvailabilityInfo
} from '../../../../shared/types';
import AvailableCredentialsInput from '../../../../client/components/AvailableCredentialsInput';
import {
  UPDATE_PROJECT_DATA,
  GET_PROJECT,
  GET_PROJECT_MEMBERS,
  SUGGEST_PROJECT_MEMBERS,
  SET_PROJECT_MEMBERS,
  GET_PROJECT_MEMBER_AVAILABILITY_TIMELINE
} from '../../../../client/graphql/project';
import { GET_USER } from '../../../../client/graphql/user';
import { resolveQuery } from '../../../../client/util/graphqlHelpers';
import { GET_TEAM } from '../../../../client/graphql/team';
import { ensureAccess } from '../../../../client/util/accessControl';
import SuggestedProjectMembers from '../../../../client/components/SuggestedProjectMembers';
import ProjectMemberList from '../../../../client/components/ProjectMemberList';
import AvailabilityTimeline from '../../../../client/components/AvailabilityTimeline';
import { contractTime } from '../../../../shared/util/time';
import { relativeTiming } from '../../../../client/util/time';
import DateRangePicker from '../../../../client/components/basic/DateRangePicker';
import {
  responsiveMaybeClipStr,
  responsiveShrinkOrClipStr
} from '../../../../client/util/responsive';
import Head from 'next/head';
import {
  resolveSkillAreas,
  resolveSkillTypes
} from '../../../../client/utilities/skills';

const EditProjectSkillsPage = () => {
  const router = useRouter();
  const apolloClient = useApolloClient();

  const [projectData, setProjectData] = useState<ProjectInfo>({
    name: '',
    id: router.query.id as string
  });
  const [updateProjectData, {}] = useMutation(UPDATE_PROJECT_DATA);
  const [skills, setSkills] = useState<ResolvedAggregatedSkill[]>([]);

  const { data, error } = useQuery(GET_PROJECT, {
    variables: { id: router.query.id }
  });
  ensureAccess(error);
  const projectInfo = useMemo(
    resolveQuery<ProjectInfo | null>(data, 'project', null),
    [data]
  );

  const { data: teamData } = useQuery(GET_TEAM, {
    variables: { id: projectInfo?.team?.id },
    skip: !projectInfo
  });

  const team = useMemo(resolveQuery<TeamInfo | null>(teamData, 'team', null), [
    teamData
  ]);

  const skillTypes = resolveSkillTypes(team);
  const skillAreas = resolveSkillAreas(team);

  const [editingSkills, setEditingSkills] = useState(true);

  const allSkillAreas = [{ value: undefined, label: 'All' }, ...skillAreas];

  const [skillArea, setSkillArea] = useState(allSkillAreas[0].value);
  const [skillTextFilter, setSkillTextFilter] = useState('');
  const [skillTextFilterDelayed, setSkillTextFilterDelayed] = useState('');
  const [setSkillTextFilterDebounced] = useDebouncedCallback(
    setSkillTextFilterDelayed,
    500
  );

  const updateSkillTextFilter = (val: string) => {
    setSkillTextFilter(val);
    setSkillTextFilterDebounced(val);
  };

  const { data: projectMembersData } = useQuery(GET_PROJECT_MEMBERS, {
    variables: {
      id: router.query.id,
      startTime: projectData.startTime,
      endTime: projectData.endTime,
      skills: skills.map((s) => s.skill.id)
    }
  });
  const projectMemberList = useMemo(
    resolveQuery<ProjectMemberInfo[] | null>(
      projectMembersData,
      'projectMembers',
      []
    ),
    [projectMembersData]
  );
  const [projectMembers, setProjectMembers] = useState<ProjectMemberInfo[]>([]);

  const [updateProjectMembers, {}] = useMutation(SET_PROJECT_MEMBERS);

  const tdate = new Date();
  const today = new Date(
    tdate.getFullYear(),
    tdate.getMonth(),
    tdate.getDate()
  ).getTime();
  const availabilityTimelineStart = Math.min(
    today,
    projectInfo?.startTime || today
  );
  const availabilityTimelineEnd = Math.max(
    availabilityTimelineStart + 86400000 * 365,
    projectInfo?.endTime || 0
  );
  const { data: memberAvailabilityData } = useQuery(
    GET_PROJECT_MEMBER_AVAILABILITY_TIMELINE,
    {
      variables: {
        id: router.query.id,
        startTime: availabilityTimelineStart,
        endTime: availabilityTimelineEnd,
        users: projectMembers.map((u) => u.user.id)
      }
    }
  );
  const memberAvailability = useMemo(
    resolveQuery<UserAvailabilityInfo[] | null>(
      memberAvailabilityData,
      'projectMemberAvailabilityTimeline',
      []
    ),
    [memberAvailabilityData]
  );

  useEffect(() => {
    if (!projectInfo) return;

    setProjectData({
      id: projectInfo.id,
      name: projectInfo.name,
      startTime: projectInfo.startTime,
      endTime: projectInfo.endTime
      // skills: projectInfo.skills,
    });
    setSkills(projectInfo.skills || skills);
  }, [projectInfo]);
  useEffect(() => {
    if (!projectMemberList) return;

    setProjectMembers([...projectMemberList]);
  }, [projectMemberList]);

  const saveSkills = async () => {
    apolloClient.writeQuery({
      query: GET_PROJECT,
      variables: { id: router.query.id },
      data: {
        project: { ...projectInfo, skills }
      }
    });
    const res = await updateProjectData({
      variables: {
        data: {
          id: projectData.id,
          skills: skills.map((s) => ({
            strength: s.strength,
            skill: s.skill.id
          })),
          startTime: projectData.startTime,
          endTime: projectData.endTime
        }
      }
      // refetchQueries: [
      // ],
    });
  };
  const [saveSkillsDebouced] = useDebouncedCallback(() => {
    saveSkills();
  }, 500);

  const confirm = async () => {
    await saveSkills();
    await updateProjectMembers({
      variables: {
        projectId: projectInfo?.id,
        users: projectMembers.map((m) => m.user.id)
      },
      refetchQueries: [
        {
          query: GET_PROJECT_MEMBERS,
          variables: {
            id: router.query.id,
            startTime: projectData.startTime,
            endTime: projectData.endTime,
            skills: skills.map((s) => s.skill.id)
          }
        }
      ]
    });
    Router.push(`/project/${router.query.id}`);
  };

  const addMember = async (member: ProjectMemberInfo) => {
    if (projectMembers.find((m) => m.user.id === member.user.id)) return;
    setProjectMembers([...projectMembers, member]);
  };
  const removeMember = async (id: string) => {
    // Do not remove the owner
    if (projectInfo?.users?.find((u) => u.user.id === id && u.role === 'owner'))
      return;
    const idx = projectMembers.findIndex((m) => m.user.id === id);
    if (idx < 0) return;
    const newMembers = projectMembers.slice();
    newMembers.splice(idx, 1);
    setProjectMembers(newMembers);
  };

  const normalizeSkillStrength = (skills: ResolvedUserSkill[]) => {
    skills.forEach((s, i) => (s.strength = Math.pow(1.0 / (i + 1), 0.5)));
    const totalStrength = skills.reduce((a, b) => a + b.strength, 0);
    skills.forEach((s) => (s.strength /= totalStrength));
    return skills;
  };
  const addSkill = (skill: ResolvedUserSkill) => {
    if (skills.find((s) => skill.skill.id === s.skill.id)) {
      toast('Skill already added');
      return;
    }
    const newSkills = [...skills, skill];
    // newSkills.forEach(s => s.strength = 1.0 / newSkills.length);
    normalizeSkillStrength(newSkills);
    setSkills(newSkills);

    console.log('skill.skill.type', skill.skill.type);
    toast('Skill added below');
  };
  const removeSkill = (skill: ResolvedUserSkill) => {
    const newSkills = [...skills.filter((s) => s.skill.id !== skill.skill.id)];
    // newSkills.forEach(s => s.strength = 1.0 / newSkills.length);
    normalizeSkillStrength(newSkills);
    setSkills(newSkills);
  };

  // console.log('projectMembers', projectMembers?.map(m => m.coveredSkills))
  const coveredSkills = new Set(
    ([] as string[]).concat(
      ...(projectMembers?.map((m) =>
        m.coveredSkills.map((s) => s.skill.id)
      ) || [[]])
    )
  );

  return (
    <>
      <Head>
        <title>Project setup</title>
      </Head>

      <TopBar />

      {team && projectInfo && (
        <>
          <div className="header project-header project-skill-search">
            <div className="container">
              <div className="block-left">
                <div className="info">
                  {projectInfo.draft && (
                    <div className="draft-indicator">Draft</div>
                  )}
                  <div className="schedule">
                    Project&nbsp;
                    {relativeTiming(
                      projectInfo.startTime,
                      projectInfo.endTime,
                      true
                    )}
                  </div>
                  <div className="name">
                    {responsiveShrinkOrClipStr(projectInfo.name, 16, 48)}
                  </div>
                  <Link href={`/project/${projectInfo.id}/edit`}>
                    <a>
                      <button className="btn-slim edit-btn">
                        Project settings
                      </button>
                    </a>
                  </Link>
                </div>
              </div>
              <div className="block-center">
                <AvailabilityTimeline
                  availability={memberAvailability || []}
                  startTime={availabilityTimelineStart}
                  endTime={availabilityTimelineEnd}
                  period={[
                    projectData.startTime || 0,
                    projectData.endTime || 0
                  ]}
                  showAvailability={
                    projectMembers.length > 0 && skills.length > 0
                  }
                />

                <DateRangePicker
                  startTime={projectData.startTime}
                  endTime={projectData.endTime}
                  onChange={({ startTime, endTime }) => {
                    setProjectData({
                      ...projectData,
                      startTime,
                      endTime
                    });
                  }}
                  startDatePlaceholderText="mm/dd/yyyy"
                  endDatePlaceholderText="mm/dd/yyyy"
                  borderColor="#afafaf"
                  displayFormat="MMM D, YYYY"
                  customArrowIcon={
                    <>
                      <span
                        style={{
                          display: 'block',
                          height: '35px',
                          padding: '0 10px',
                          paddingTop: '9px',
                          color: '#666',
                          fontSize: '12px',
                          backgroundColor: '#f2f2f2'
                        }}
                      >
                        to
                      </span>
                    </>
                  }
                />
              </div>

              <div className="block-right">
                <button
                  className="btn save-btn"
                  onClick={(evt) => confirm()}
                  disabled={skills.length < 1}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>

          {editingSkills && (
            <>
              <Header slim={true}>
                <Header.Section>
                  <div className="skill-availability-legend">
                    <div
                      className="marker"
                      style={{ backgroundColor: '#000' }}
                    />
                    <div className="label">Available</div>
                    <div
                      className="marker"
                      style={{ backgroundColor: '#F8D247' }}
                    />
                    <div className="label">Unavailable</div>
                  </div>
                </Header.Section>

                <Header.Section fill={true} spacing="none">
                  <Tabs
                    items={allSkillAreas.map((sa) => ({
                      content: sa.label,
                      active: sa.value === skillArea,
                      onClick: () => setSkillArea(sa.value)
                    }))}
                  />
                </Header.Section>

                <Header.Section>
                  <Input
                    placeholder="Search Skills"
                    value={skillTextFilter}
                    appearance="border"
                    prefix={<img width={14} height={14} src="/icons/search.svg" />}
                    suffix={skillTextFilter.length > 0 && <img src="/icons/cross-grey.svg" onClick={() => updateSkillTextFilter('')} />}
                    onChange={(value) =>
                      updateSkillTextFilter(value)
                    }
                  />
                </Header.Section>
              </Header>

              <Page>
                <Grid equalHeight={true} columns="three">
                  {skillTypes.map((skillType, i) => (
                    <TeamSkillsDisplay
                      key={i}
                      team={projectInfo.team!}
                      skillType={skillType.value}
                      skillArea={skillArea}
                      textFilter={skillTextFilterDelayed}
                      label={skillType.label}
                      description="Click to select"
                      onSkillClick={addSkill}
                    />
                  ))}
                </Grid>
              </Page>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  className="btn centered"
                  onClick={(evt) => setEditingSkills(false)}
                >
                  Done
                </button>
              </div>
            </>
          )}

          <Page>
            <Layout>
              <Layout.Section secondary={true}>
                <Card>
                  <Card.Header>
                    <Subheading>
                      Selected Team ({projectMembers?.length})
                    </Subheading>
                  </Card.Header>

                  <Card.Section>
                    <ProjectMemberList
                      members={projectMembers || []}
                      {...{ onRemove: removeMember }}
                    />
                  </Card.Section>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Card>
                  <Card.Header>
                    <Stack alignment="center" distribution="equalSpacing">
                      <DisplayText>{skills.length} Skills Selected</DisplayText>

                      {!editingSkills && (
                        <a
                          className="edit"
                          onClick={(evt) => setEditingSkills(true)}
                        >
                          <img src="/icons/edit.svg" />
                        </a>
                      )}
                    </Stack>
                  </Card.Header>

                  {skills.length > 0 ? (
                    <BubbleSkillsDisplay
                      skills={skills.map((s) => ({
                        ...s,
                        userCount: coveredSkills.has(s.skill.id)
                          ? undefined
                          : 1,
                        unavailableCount: coveredSkills.has(s.skill.id)
                          ? undefined
                          : 1
                      }))}
                      scale={1.3}
                      large={true}
                      unavailabilityStyle={{
                        color: '#666',
                        background: '#f2f2f2'
                      }}
                      onClick={(skill) => editingSkills && removeSkill(skill)}
                    />
                  ) : (
                    <div
                      style={{
                        backgroundImage:
                          'url(/img/project-skills-placeholder.png)',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center top',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '600px'
                      }}
                    />
                  )}
                </Card>
              </Layout.Section>

              <Layout.Section secondary={true}>
                <Card sectioned={true}>
                  {skills.length > 0 ? (
                    <SuggestedProjectMembers
                      projectId={projectInfo.id || ''}
                      skills={skills.map((s) => s.skill.id)}
                      startTime={projectData.startTime || 0}
                      endTime={projectData.endTime || 0}
                      selectedMembers={
                        projectMembers?.map((u) => u.user.id || '') || []
                      }
                      onAdd={addMember}
                      onRemove={removeMember}
                    />
                  ) : (
                    <div
                      style={{
                        backgroundImage:
                          'url(/img/suggested-project-members-placeholder.png)',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center top',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '400px'
                      }}
                    />
                  )}
                </Card>
              </Layout.Section>
            </Layout>
          </Page>
        </>
      )}

      <ToastContainer
        position="bottom-center"
        autoClose={2500}
        hideProgressBar={true}
        enableMultiContainer={true}
        transition={Slide}
        closeButton={false}
        pauseOnHover={false}
      />

      <HelpButton />
    </>
  );
};

export default withApollo(EditProjectSkillsPage);
