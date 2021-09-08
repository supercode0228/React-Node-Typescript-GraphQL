/**
 * @format
 */

import '../../app.scss';
import { useApolloClient, useMutation, useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import { useDebouncedCallback } from 'use-debounce';
import {
  Avatar,
  BubbleSkillsDisplay,
  DisplayText,
  Header,
  HelpButton,
  Hint,
  Link,
  SectorSkillsDisplay,
  SkillOnboardingIntroduction,
  SkillSearch,
  Stack,
  Tabs,
  Tag,
  TopBar
} from '../../../client/components';
import SkillDanEditor from '../../../client/components/SkillDanEditor';
import TeamMembersThatAlsoKnowSkill from '../../../client/components/TeamMembersThatAlsoKnowSkill';
import {
  GET_USER_SKILLS,
  UPDATE_USER_SKILLS
} from '../../../client/graphql/skills';
import { GET_TEAM } from '../../../client/graphql/team';
import { GET_USER } from '../../../client/graphql/user';
import { ensureAccess } from '../../../client/util/accessControl';
import { resolveQuery } from '../../../client/util/graphqlHelpers';
import { teamAvatarUrl } from '../../../client/util/profile';
import { resolveSkillTypes } from '../../../client/utilities/skills';
import { withApollo } from '../../../lib/apollo';
import {
  ResolvedUserSkill,
  Skill,
  TeamInfo,
  UserInfo
} from '../../../shared/types';

const SkillsPage = () => {
  const router = useRouter();
  const apolloClient = useApolloClient();

  const type = router.query.type as string;
  const initialEditing = router.query.edit != null;

  const { data, error, loading } = useQuery(GET_USER_SKILLS, {
    variables: { type }
  });

  ensureAccess(error);

  const userSkills = useMemo(
    resolveQuery<ResolvedUserSkill[]>(data, 'userSkills', []),
    [data]
  );

  const { data: userData } = useQuery(GET_USER);

  const user = useMemo(resolveQuery<UserInfo | null>(userData, 'user', null), [
    userData
  ]);

  const { data: teamData } = useQuery(GET_TEAM, {
    variables: { id: user?.activeTeam },
    skip: !user
  });

  const team = useMemo(resolveQuery<TeamInfo | null>(teamData, 'team', null), [
    teamData
  ]);

  const skillTypes = resolveSkillTypes(team);
  const skillType = skillTypes.find((st) => st.value === type);
  const isSector = skillType?.visualization === 'sector';
  const isSoftwareType = skillType?.value === 'software';

  const [updateUserSkills] = useMutation(UPDATE_USER_SKILLS);

  const [passedIntroduction, setPassedIntroduction] = useState(initialEditing);
  const [editing, setEditing] = useState(initialEditing);
  const [dirty, setDirty] = useState(false);

  const [initialUserSkills, setInitialUserSkills] = useState<
    ResolvedUserSkill[]
  >([]);

  const [hintVisible, setHintVisible] = useState(false);

  const [
    selectedUserSkill,
    setSelectedUserSkill
  ] = useState<ResolvedUserSkill | null>(null);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!user.activeTeam || team) {
      setIsReady(true);
    }
  }, [user, team]);

  useEffect(() => {
    if (!initialUserSkills.length) {
      setInitialUserSkills(userSkills);
    }

    if (!loading && !userSkills.length) {
      setHintVisible(true);
    }
  }, [userSkills]);

  function toggleHint() {
    setHintVisible((visible) => !visible);
  }

  function handleUndo() {
    save(initialUserSkills);
    setDirty(false);
  }

  function normalizeSkills(skills: ResolvedUserSkill[]) {
    if (skills.length < 1) {
      return skills;
    }

    const strengthSum = skills.reduce((a, b) => a + b.strength, 0);
    skills.forEach((s) => {
      s.strength = s.strength / strengthSum;
    });
    return skills;
  }

  function addSkill(skill: Skill) {
    const maxSkills = 10;
    if (userSkills.length >= maxSkills) {
      toast(`You can only add ${maxSkills} skills`);
      return;
    }

    let strength = 1.0 / Math.max(userSkills.length, 1.0);

    if (isSector) {
      strength = -1;
    }

    const newUserSkill = {
      user: '',
      skill,
      strength: strength,
      modifiedTime: Date.now()
    };

    // Prevent skill duplication
    if (userSkills.find((us) => us.skill.id === newUserSkill.skill.id)) {
      return;
    }

    if (isSector) {
      setSelectedUserSkill(newUserSkill);
    } else {
      const newUserSkills = normalizeSkills([...userSkills, newUserSkill]);

      save(newUserSkills);
    }
  }

  function removeSkill(index: number) {
    const newUserSkills = userSkills.slice();
    newUserSkills.splice(index, 1);
    save(normalizeSkills(newUserSkills));
  }

  function saveSelectedUserSkill() {
    if (!selectedUserSkill) {
      return;
    }

    let newUserSkills: ResolvedUserSkill[] = [];
    if (!userSkills.find((us) => us.skill.id === selectedUserSkill.skill.id)) {
      newUserSkills = [...userSkills, selectedUserSkill];
    } else {
      newUserSkills = [...userSkills];
      const existingUserSkill = newUserSkills.find(
        (us) => us.skill.id === selectedUserSkill.skill.id
      );

      if (existingUserSkill) {
        existingUserSkill.strength = selectedUserSkill.strength;
      }
    }

    save(newUserSkills);
    setSelectedUserSkill(null);
  }

  function removeSelectedUserSkill() {
    if (!selectedUserSkill) {
      return;
    }

    const idx = userSkills.findIndex(
      (us) => us.skill.id === selectedUserSkill.skill.id
    );

    if (idx != null && idx >= 0) {
      const newUserSkills = userSkills.slice();
      newUserSkills.splice(idx, 1);

      save(newUserSkills);
      setSelectedUserSkill(null);
    }
  }

  async function save(newUserSkills: ResolvedUserSkill[]) {
    setDirty(true);

    apolloClient.writeQuery({
      query: GET_USER_SKILLS,
      variables: { type },
      data: {
        userSkills: newUserSkills.map((us) => ({
          ...us,
          __typename: 'UserSkill',
          modifiedTime: us.modifiedTime || Date.now()
        }))
      }
    });

    let refetchQueries: any[] = [];
    if (userSkills.length > 0 !== newUserSkills.length > 0) {
      refetchQueries = [
        {
          query: GET_USER_SKILLS,
          variables: { type }
        }
      ];
    }

    await updateUserSkills({
      variables: {
        type,
        skills: newUserSkills.map((us) => ({
          skill: us.skill.id,
          strength: us.strength,
          sortOrder: us.sortOrder
        }))
      },
      refetchQueries
    });

    if (newUserSkills.length === 0 && !passedIntroduction) {
      setEditing(false);
    }
  }

  function sort(order: number = 1) {
    const sortedUserSkills = [
      ...userSkills.slice().sort((a, b) => (a.strength - b.strength) * order)
    ].map((us, index) => ({ ...us, sortOrder: userSkills.length - index }));

    save(sortedUserSkills);
  }

  const [saveUserSkillsDebounced] = useDebouncedCallback(save, 500);

  return (
    <>
      <Head>
        <title>Skills</title>
      </Head>

      <TopBar />

      {isReady && skillType && !loading && (
        <>
          <Header slim={true}>
            <Tabs
              items={skillTypes.map((st) => ({
                content: st.label as string,
                badge: !st.default && (
                  <Avatar
                    url={teamAvatarUrl(st.team)}
                    border={true}
                    size="extraSmall"
                  />
                ),
                url: `/skills/${st.value}`,
                active: st.value === type
              }))}
              scrollBehavior="auto"
            />
          </Header>

          <div className="container">
            <div className="block-left">
              {skillType.default && (
                <div className="tile">
                  <Hint
                    title={skillType.label as string}
                    description={skillType.definition as string}
                    illustration={`/img/skill-intro/definition-${skillType.value}.svg`}
                    label="Definition"
                    visible={hintVisible}
                    onClose={() => setHintVisible(false)}
                  />
                </div>
              )}
            </div>

            <div className="block-center">
              <div className="tile">
                <div className="extruded-surface">
                  {!userSkills.length && !passedIntroduction ? (
                    <SkillOnboardingIntroduction
                      skillType={skillType}
                      skillArea={user?.skillArea}
                      onDismiss={() => {
                        setPassedIntroduction(true);
                        setEditing(true);
                      }}
                    />
                  ) : (
                    <>
                      {selectedUserSkill ? (
                        <>
                          <div
                            className="back"
                            onClick={() => {
                              setSelectedUserSkill(null);
                            }}
                          >
                            <img src="/icons/arrow-left.svg" />
                            Back to overview
                          </div>

                          <SkillDanEditor
                            skill={selectedUserSkill}
                            onChange={(skill) => setSelectedUserSkill(skill)}
                            onDone={saveSelectedUserSkill}
                            onRemove={removeSelectedUserSkill}
                          />
                        </>
                      ) : (
                        <>
                          <div className="tiny-marker">Showing</div>

                          <div className="skill-summary-header">
                            <DisplayText>
                              {userSkills.length} {skillType.label}
                            </DisplayText>

                            {!editing && (
                              <button
                                className="btn-inv add-btn"
                                onClick={() => setEditing(true)}
                              >
                                + Add/Edit
                              </button>
                            )}
                          </div>

                          <div className="interaction-hint">
                            {skillType.visualization === 'sector' ? (
                              <>
                                Add a {skillType.label?.toLowerCase()} and
                                select your
                                <span className="skill-levels-hint">
                                  skill level
                                  <div className="scale">
                                    <div className="p1" />
                                    <div className="p2" />
                                    <div className="p3" />
                                  </div>
                                </span>
                              </>
                            ) : (
                              <p>
                                <strong>Click/Tap/Drag</strong> to make the
                                circles bigger
                                <br />
                                and show what your focus really is
                              </p>
                            )}

                            {dirty && (
                              <div className="undo">
                                <Link badge={true} onClick={handleUndo}>
                                  <Stack
                                    spacing="extraTight"
                                    alignment="center"
                                  >
                                    <img
                                      className="icon"
                                      src="/icons/undo.svg"
                                    />
                                    <span>Undo</span>
                                  </Stack>
                                </Link>
                              </div>
                            )}
                          </div>

                          {skillType.visualization === 'bubbles' ? (
                            <BubbleSkillsDisplay
                              skills={userSkills}
                              editable={true}
                              large={true}
                              onChange={saveUserSkillsDebounced}
                            />
                          ) : (
                            <Stack vertical={true}>
                              <Stack.Item>
                                <button
                                  className="sort-skills"
                                  onClick={() => sort(-1)}
                                  title="Sort descending"
                                >
                                  <img src="/icons/arrow-down.svg" />
                                </button>

                                <button
                                  className="sort-skills"
                                  onClick={() => sort(1)}
                                  title="Sort ascending"
                                >
                                  <img src="/icons/arrow-up.svg" />
                                </button>
                              </Stack.Item>

                              <SectorSkillsDisplay
                                skills={userSkills}
                                user={user}
                                large={true}
                                onChange={saveUserSkillsDebounced}
                                onClick={(skill) => setSelectedUserSkill(skill)}
                              />
                            </Stack>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="block-right" style={{ float: 'right' }}>
              {selectedUserSkill && (
                <div className="tile">
                  <div className="extruded-surface slim">
                    <TeamMembersThatAlsoKnowSkill
                      skill={selectedUserSkill.skill}
                    />
                  </div>
                </div>
              )}

              {editing && !selectedUserSkill && (
                <div className="tile">
                  <div className="extruded-surface">
                    <img
                      className="close"
                      src="/icons/cross-big.svg"
                      onClick={() => setEditing(false)}
                    />

                    <Stack vertical={true}>
                      {isSoftwareType ? (
                        <>
                          <div className="inquiry">
                            What technical tools do
                            <br />
                            you work with?
                          </div>

                          <div className="interaction-hint">
                            Click the <strong>technical tool logo</strong> that
                            you work with
                          </div>
                        </>
                      ) : (
                        <div className="inquiry">
                          What’s your
                          <br />
                          {skillType.label}
                        </div>
                      )}

                      {!isSector && userSkills.length > 0 && (
                        <Stack spacing="tight">
                          {userSkills.map((us, index) => (
                            <Tag
                              key={index}
                              onRemove={() => removeSkill(index)}
                            >
                              {us.skill.name}
                            </Tag>
                          ))}
                        </Stack>
                      )}

                      <SkillSearch
                        skillType={skillType}
                        exclude={userSkills.map((us) => us.skill.id)}
                        limit={isSoftwareType ? 9 : 3}
                        showEmpty={isSoftwareType}
                        onSelect={addSkill}
                      />
                    </Stack>
                  </div>
                </div>
              )}
            </div>
          </div>
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

      <HelpButton
        customActions={
          skillType?.default
            ? [
                {
                  content: `${hintVisible ? 'Hide' : 'Show'} hint/s`,
                  onClick: () => toggleHint()
                }
              ]
            : []
        }
      />
    </>
  );
};

export default withApollo(SkillsPage);
