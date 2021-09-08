import { withApollo } from '../../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useMutation, useQuery, useApolloClient } from '@apollo/react-hooks';
import ReactTagInput from '@pathofdev/react-tag-input';
import { useDebouncedCallback } from 'use-debounce';
import { IntlProvider } from 'react-intl';
import copy from 'copy-to-clipboard';
import getConfig from 'next/config';

import '../app.scss';
import {
  Avatar,
  BubbleSkillsDisplay,
  Card,
  Grid,
  Header,
  Heading,
  HelpButton,
  Label,
  Layout,
  Page,
  ProjectSkillsDisplay,
  Stack,
  Subheading,
  Tag,
  TextStyle,
  TopBar
} from '../../client/components';
import {
  ProjectInfo,
  UserInfo,
  ResolvedUserSkill,
  TeamInfo,
  UserAvailabilityInfo
} from '../../shared/types';
import AvailableCredentialsInput from '../../client/components/AvailableCredentialsInput';
import {
  UPDATE_PROJECT_DATA,
  GET_PROJECT,
  GET_PROJECT_MEMBER_AVAILABILITY_TIMELINE
} from '../../client/graphql/project';
import { GET_USER } from '../../client/graphql/user';
import { resolveQuery } from '../../client/util/graphqlHelpers';
import { GET_TEAM } from '../../client/graphql/team';
import { ensureAccess } from '../../client/util/accessControl';
import { relativeTiming } from '../../client/util/time';
import { isNullOrEmpty, maybeClipStr } from '../../shared/util/str';
import AvailabilityTimeline from '../../client/components/AvailabilityTimeline';
import Tooltip from '../../client/components/basic/Tooltip';
import { userAvatarUrl } from '../../client/util/profile';
import {
  responsiveMaybeClipStr,
  responsiveShrinkOrClipStr
} from '../../client/util/responsive';
import Head from 'next/head';
import { resolveSkillTypes } from '../../client/utilities/skills';

const { publicRuntimeConfig } = getConfig();

const ProjectPage = () => {
  const router = useRouter();

  const { data, error } = useQuery(GET_PROJECT, {
    variables: { id: router.query.id, accessKey: router.query.accessKey }
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

  const team = useMemo(
    resolveQuery<TeamInfo | undefined>(teamData, 'team', undefined),
    [teamData]
  );

  const skillTypes = resolveSkillTypes(team);

  const [updateProjectData, {}] = useMutation(UPDATE_PROJECT_DATA);

  const { data: memberAvailabilityData } = useQuery(
    GET_PROJECT_MEMBER_AVAILABILITY_TIMELINE,
    {
      variables: {
        id: router.query.id,
        accessKey: router.query.accessKey,
        startTime: projectInfo?.startTime,
        endTime: projectInfo?.endTime,
        users: projectInfo?.users?.map((u) => u.user.id)
      },
      skip: !projectInfo || !projectInfo.startTime || !projectInfo.endTime
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

  const creator = projectInfo?.creator; // users?.find(u => u.role === 'owner');

  const publishProject = async () => {
    await updateProjectData({
      variables: { data: { id: projectInfo?.id, draft: false } },
      refetchQueries: [
        {
          query: GET_PROJECT,
          variables: { id: router.query.id }
        },
        {
          query: GET_TEAM,
          variables: { alias: projectInfo?.team?.alias }
        }
      ]
    });
  };

  return (
    <>
      <Head>
        <title>{projectInfo?.name + ' on Tests'}</title>
      </Head>

      <TopBar />

      {projectInfo && (
        <>
          <Header>
            <Header.Section>
              <Stack vertical={true} spacing="extraTight">
                {projectInfo.draft && (
                  <Tag color="yellow">Draft</Tag>
                )}

                <Stack wrap={false} alignment="center">
                  <Stack.Item fill={true}>
                    <TextStyle uppercase={true} size="small">
                      Project&nbsp;
                      {relativeTiming(
                        projectInfo.startTime,
                        projectInfo.endTime,
                        true
                      )}
                    </TextStyle>
                  </Stack.Item>

                  {projectInfo.myRole === 'owner' && (
                    <Tooltip tooltip="Copied!" trigger="click">
                      <a
                        onTouchEnd={(evt) =>
                          copy(
                            `${publicRuntimeConfig.RootUri}/project/${projectInfo.id}?accessKey=${projectInfo.accessKey}`
                          )
                        }
                        onClick={(evt) =>
                          copy(
                            `${publicRuntimeConfig.RootUri}/project/${projectInfo.id}?accessKey=${projectInfo.accessKey}`
                          )
                        }
                      >
                        <img src="/icons/share-copy.svg" />
                      </a>
                    </Tooltip>
                  )}
                </Stack>

                <Heading>
                  {responsiveShrinkOrClipStr(projectInfo.name, 16, 48)}
                </Heading>

                {projectInfo.myRole === 'owner' && (
                  <Link href={`/project/${projectInfo.id}/edit`}>
                    <a>
                      <button className="btn-slim edit-btn">
                        Project Settings
                      </button>
                    </a>
                  </Link>
                )}
              </Stack>
            </Header.Section>

            <Header.Section fill={true}>
              <Stack vertical={true}>
                <TextStyle>{projectInfo.about}</TextStyle>

                <Stack spacing="extraTight">
                  {projectInfo.tags?.map((tag, index) => (
                    <Tag key={index} color="blue">{tag}</Tag>
                  ))}
                </Stack>
              </Stack>
            </Header.Section>

            <Header.Section action={true}>
              {projectInfo.draft && projectInfo.myRole === 'owner' && (
                <button
                  className="btn save-btn"
                  onClick={(evt) => publishProject()}
                  disabled={!projectInfo.startTime || !projectInfo.endTime}
                >
                  Publish
                </button>
              )}
            </Header.Section>
          </Header>

          <Page>
            <Layout>
              <Layout.Section secondary={true}>
                <Card>
                  {creator && (
                    <Card.Section>
                      <Label>Project creator</Label>

                      <Link href={`/user/${creator.alias}`}>
                        <a>
                          <Stack spacing="tight" alignment="center">
                            <Avatar url={userAvatarUrl(creator)} />

                            <Stack vertical={true} spacing="extraTight">
                              <TextStyle>
                                <strong>{creator.name}</strong>
                              </TextStyle>

                              {creator.jobTitle && (
                                <TextStyle subdued={true}>
                                  <strong>{creator.jobTitle}</strong>
                                </TextStyle>
                              )}
                            </Stack>
                          </Stack>
                        </a>
                      </Link>
                    </Card.Section>
                  )}

                  <Card.Section>
                    <Stack alignment="center" distribution="equalSpacing">
                      <Label>Team</Label>

                      {projectInfo.myRole === 'owner' && (
                        <Link href={`/project/${projectInfo.id}/skills/edit`}>
                          <a>
                            <img
                              className="edit-icon"
                              src="/icons/edit-user.svg"
                            />
                          </a>
                        </Link>
                      )}
                    </Stack>

                    <Stack alignment="center" spacing="extraTight">
                      {projectInfo.users?.map((member, i) => (
                        <Link key={i} href={`/user/${member.user.alias}`}>
                          <a>
                            <Avatar url={userAvatarUrl(member.user)} />
                          </a>
                        </Link>
                      ))}
                    </Stack>
                  </Card.Section>

                  {projectInfo.startTime &&
                    projectInfo.endTime &&
                    memberAvailability && (
                      <Card.Section>
                        <Label>Team Availability</Label>

                        <AvailabilityTimeline
                          availability={memberAvailability}
                          startTime={projectInfo.startTime}
                          endTime={projectInfo.endTime}
                          startLabel="Start"
                          wide={true}
                          low={true}
                        />
                      </Card.Section>
                    )}

                  {!isNullOrEmpty(projectInfo.references) && (
                    <Card.Section>
                      <Stack alignment="center" distribution="equalSpacing">
                        <Label>Articles & Reference Links</Label>

                        {projectInfo.myRole === 'owner' && (
                          <Link href={`/project/${projectInfo.id}/skills/edit`}>
                            <a>
                              <img
                                className="edit-icon"
                                src="/icons/edit-user.svg"
                              />
                            </a>
                          </Link>
                        )}
                      </Stack>

                      {projectInfo.references?.map((r, i) => (
                        <div key={i} style={{ margin: '6px 0' }}>
                          <span
                            className="brand-icon"
                            style={{
                              backgroundImage: `url(/icons/link.svg)`,
                              backgroundSize: 'fit',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center'
                            }}
                          />
                          <span
                            style={{
                              verticalAlign: 'middle',
                              marginLeft: '10px'
                            }}
                          >
                            <a
                              href={r}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {r.length < 22 ? r : r.substr(0, 25) + '...'}
                            </a>
                          </span>
                        </div>
                      ))}
                    </Card.Section>
                  )}
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Stack vertical={true}>
                  <Grid equalHeight={true} keepLayout={true} columns="two">
                    <Card>
                      <Card.Header>
                        <Stack alignment="center" distribution="equalSpacing">
                          <Heading>Project specified skills</Heading>

                          {projectInfo.myRole === 'owner' && (
                            <Link
                              href={`/project/${router.query.id}/skills/edit`}
                            >
                              <a className="edit">
                                <img src="/icons/edit.svg" />
                              </a>
                            </Link>
                          )}
                        </Stack>
                      </Card.Header>

                      <BubbleSkillsDisplay
                        skills={projectInfo.skills || []}
                        scale={1.3}
                        large={true}
                      />
                    </Card>

                    <Stack vertical={true}>
                      {skillTypes
                        .filter((st) => ['job', 'soft'].includes(st.value!))
                        .map((skillType, index) => (
                          <Card key={index}>
                            <Card.Header>
                              <Subheading>Team's {skillType.label}</Subheading>
                            </Card.Header>

                            <ProjectSkillsDisplay
                              project={projectInfo}
                              skillType={skillType.value as string}
                              visualization={skillType.visualization}
                              scale={
                                skillType.visualization === 'sector' ? 0.6 : 1.0
                              }
                            />
                          </Card>
                        ))}
                    </Stack>
                  </Grid>

                  {skillTypes
                    .filter((st) => !['job', 'soft'].includes(st.value!))
                    .map((skillType, index) => (
                      <Card key={index}>
                        <Card.Header>
                          <Subheading>Team's {skillType.label}</Subheading>
                        </Card.Header>

                        <ProjectSkillsDisplay
                          project={projectInfo}
                          skillType={skillType.value as string}
                          visualization={skillType.visualization}
                          large={true}
                        />
                      </Card>
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
};

export default withApollo(ProjectPage);
