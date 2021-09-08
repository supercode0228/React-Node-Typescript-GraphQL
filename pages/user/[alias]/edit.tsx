/**
 * @format
 */

import '../../app.scss';
import { useQuery, useMutation } from '@apollo/react-hooks';
import getConfig from 'next/config';
import Head from 'next/head';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import ReactTagInput from '@pathofdev/react-tag-input';
import React, { useEffect, useState, useMemo } from 'react';
import SocialLinkListEditor from '../../../client/components/SocialLinkListEditor';
import {
  ActionList,
  Card,
  HelpButton,
  Input,
  JobExperience,
  Label,
  Layout,
  Page,
  PersonalNote,
  PersonalNoteForm,
  PlacesAutocomplete,
  Popover,
  Select,
  Stack,
  TopBar,
  UserTeamEditor
} from '../../../client/components';
import {
  GET_USER,
  UPDATE_USER_DATA,
  GET_PERSONAL_NOTES
} from '../../../client/graphql/user';
import {
  ensureAccess,
  onlyOwnerAccess
} from '../../../client/util/accessControl';
import { resolveQuery } from '../../../client/util/graphqlHelpers';
import { userAvatarUrl } from '../../../client/util/profile';
import { withApollo } from '../../../lib/apollo';
import skillAreas from '../../../shared/data/skillAreas.json';
import { UserInfo, PersonalNoteInfo } from '../../../shared/types';
import { DescriptionMaxLength } from '../../../shared/sharedConfig';

const { publicRuntimeConfig } = getConfig();

function UserEditPage() {
  const router = useRouter();

  const { data, error, refetch } = useQuery(GET_USER, {
    variables: { alias: router.query.alias }
  });

  ensureAccess(error);

  const user = useMemo(resolveQuery<UserInfo | null>(data, 'user', null), [
    data
  ]);

  onlyOwnerAccess(user);

  const { data: personalNotesData, refetch: refetchPersonalNotes } =
    useQuery(GET_PERSONAL_NOTES);

  const personalNotes = useMemo(
    resolveQuery<PersonalNoteInfo[] | null>(
      personalNotesData,
      'personalNotes',
      []
    ),
    [personalNotesData]
  );

  const [updateUserData] = useMutation(UPDATE_USER_DATA);

  const [userData, setUserData] = useState<UserInfo | undefined>(undefined);

  const [experiencePopoverActive, setExperiencePopoverActive] =
    useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setUserData({
      name: user.name,
      alias: user.alias,
      skillArea: user.skillArea,
      publicProfile: user.publicProfile,
      about: user.about,
      jobTitle: user.jobTitle,
      location: user.location,
      links: user.links,
      references: user.references,
      jobExperience: user.jobExperience
    });
  }, [user]);

  function toggleExperiencePopover() {
    setExperiencePopoverActive((active) => !active);
  }

  async function save() {
    await updateUserData({
      variables: {
        data: {
          ...userData,
          jobExperience: userData?.jobExperience?.map((jobExperience) => ({
            ...jobExperience,
            __typename: undefined
          }))
        }
      },
      refetchQueries: [
        {
          query: GET_USER,
          variables: { alias: router.query.alias }
        }
      ]
    });

    Router.push(`/user/${userData?.alias}`);
  }

  const skillAreaOptions = Object.keys(skillAreas).map((skillArea) => ({
    value: skillArea,
    ...(skillAreas as any)[skillArea]
  }));

  return (
    <>
      <Head>
        <title>Profile Settings</title>
      </Head>

      <TopBar />

      {user && user.me && userData && (
        <>
          <div className="header">
            <div className="container">
              <div className="block-left">
                <div
                  className="avatar"
                  style={{
                    backgroundImage: `url(${userAvatarUrl(user)})`,
                    backgroundSize: 'cover'
                  }}
                />
                <div className="info">
                  <div className="name">{user.name}</div>
                  <div className="location">{user.location}</div>
                  <Link href={`/user/${user.alias}/settings`}>
                    <a>
                      <button className="btn-slim edit-btn">
                        Account Settings
                      </button>
                    </a>
                  </Link>
                </div>
              </div>
              <div className="block-center shrink-mobile">
                <div className="handle">
                  <div className="title">Your Tests URL</div>
                  <div className="url">
                    {publicRuntimeConfig.RootUri}/user/
                    <strong>{userData.alias}</strong>
                  </div>
                </div>
              </div>
              <div className="block-right shrink-mobile">
                <button className="btn save-btn" onClick={save}>
                  Save
                </button>
              </div>
            </div>
          </div>

          <Page>
            <Layout>
              <Layout.Section secondary={true}>
                <Stack vertical={true}>
                  <>
                    <strong>Profile details</strong>
                  </>

                  <Card>
                    <Card.Section>
                      <Input
                        label="About me"
                        placeholder="Write a simple overview of yourself and what you are doing. Look at it as your elevator pitch to all those who want to know more about you."
                        value={userData.about}
                        multiline={true}
                        maxLength={DescriptionMaxLength}
                        onChange={(about) =>
                          setUserData({ ...userData, about })
                        }
                      />
                    </Card.Section>

                    <Card.Section>
                      <Input
                        label="Job title"
                        value={userData.jobTitle}
                        onChange={(jobTitle) =>
                          setUserData({ ...userData, jobTitle })
                        }
                      />
                    </Card.Section>

                    <Card.Section>
                      <PlacesAutocomplete
                        label="City"
                        value={userData.location}
                        onChange={(location) =>
                          setUserData({
                            ...userData,
                            location: location as string
                          })
                        }
                      />
                    </Card.Section>

                    <Card.Section>
                      <Select
                        label="Skill area"
                        placeholder="What role best describes you?"
                        value={userData.skillArea}
                        options={skillAreaOptions}
                        onChange={(skillArea) =>
                          setUserData({ ...userData, skillArea })
                        }
                      />
                    </Card.Section>

                    <Card.Section>
                      <Label>Elsewhere</Label>

                      <SocialLinkListEditor
                        value={
                          !userData.links || userData.links.length < 1
                            ? ['']
                            : userData.links
                        }
                        onChange={(links) =>
                          setUserData({
                            ...userData,
                            links:
                              links.length === 1
                                ? links?.filter((l) => l.length > 0)
                                : links
                          })
                        }
                      />
                    </Card.Section>

                    <Card.Section>
                      <Label>Articles & reference links</Label>

                      <ReactTagInput
                        tags={userData.references || []}
                        onChange={(newTags) =>
                          setUserData({ ...userData, references: newTags })
                        }
                        placeholder="&nbsp;"
                      />
                      <span
                        style={{
                          fontSize: '12px',
                          opacity: 0.5,
                          marginTop: '5px'
                        }}
                      >
                        Press <strong>enter</strong> to add a link
                      </span>
                    </Card.Section>
                  </Card>
                </Stack>
              </Layout.Section>

              <Layout.Section>
                <Stack vertical={true}>
                  <>
                    <strong>Career notes & goals</strong>
                  </>

                  <Card sectioned={true}>
                    <PersonalNoteForm onSave={refetchPersonalNotes} />

                    {personalNotes?.map((personalNote, index) => (
                      <PersonalNote
                        key={index}
                        personalNote={personalNote}
                        onRemove={refetchPersonalNotes}
                      />
                    ))}
                  </Card>
                </Stack>
              </Layout.Section>

              <Layout.Section secondary={true}>
                <Stack vertical={true}>
                  <>
                    <strong>Teams</strong>
                  </>

                  <Stack.Item>
                    {user.teams?.map((userTeam, index) => (
                      <UserTeamEditor
                        key={index}
                        userTeam={userTeam}
                        userId={user.id as string}
                        activeTeam={user.activeTeam}
                        onTeamLeave={refetch}
                      />
                    ))}
                  </Stack.Item>

                  <>
                    <Stack>
                      <Stack.Item fill={true}>
                        <strong>Job experience</strong>
                      </Stack.Item>

                      <Stack.Item>
                        <Popover
                          active={experiencePopoverActive}
                          activator={
                            <button
                              onClick={toggleExperiencePopover}
                              className="btn-slim"
                            >
                              + Add Job
                            </button>
                          }
                          onClose={toggleExperiencePopover}
                        >
                          <ActionList
                            sections={[
                              {
                                items: [
                                  {
                                    content: '+ Add name manually',
                                    onClick: () => {
                                      let newJobExperience =
                                        userData.jobExperience;

                                      newJobExperience?.unshift({
                                        customName: '',
                                        startTime: Date.now(),
                                        endTime: Date.now()
                                      });

                                      setUserData({
                                        ...userData,
                                        jobExperience: newJobExperience
                                      });
                                    }
                                  }
                                ]
                              },
                              {
                                items: user.teams
                                  ? user.teams.map((userTeam) => ({
                                      content: `+ ${userTeam.team.name}`,
                                      onClick: () => {
                                        let newJobExperience =
                                          userData.jobExperience;

                                        newJobExperience?.unshift({
                                          team: userTeam.team.id,
                                          startTime: Date.now(),
                                          endTime: Date.now()
                                        });

                                        setUserData({
                                          ...userData,
                                          jobExperience: newJobExperience
                                        });
                                      }
                                    }))
                                  : []
                              }
                            ]}
                            onClickAnyItem={toggleExperiencePopover}
                          />
                        </Popover>
                      </Stack.Item>
                    </Stack>
                  </>

                  {userData.jobExperience?.map((jobExperience, index) => (
                    <JobExperience
                      key={index}
                      jobExperience={jobExperience}
                      userTeams={user.teams}
                      onChange={(data) => {
                        let newJobExperience = userData.jobExperience || [];
                        newJobExperience[index] = data;

                        setUserData({
                          ...userData,
                          jobExperience: newJobExperience
                        });
                      }}
                      onRemove={() => {
                        let newJobExperience = userData.jobExperience || [];
                        newJobExperience.splice(index, 1);

                        setUserData({
                          ...userData,
                          jobExperience: newJobExperience
                        });
                      }}
                    />
                  ))}
                </Stack>
              </Layout.Section>
            </Layout>
          </Page>
        </>
      )}

      <HelpButton />
    </>
  );
}

export default withApollo(UserEditPage);
