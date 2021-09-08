/**
 * @format
 */

import '../app.scss';
import { useQuery, useMutation } from '@apollo/react-hooks';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import getConfig from 'next/config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import Dropdown, {
  DropdownTrigger,
  DropdownContent
} from 'react-simple-dropdown';
import { GET_USER_SKILLS } from '../../client/graphql/skills';
import { GET_TEAM } from '../../client/graphql/team';
import { GET_USER, UPDATE_USER_DATA } from '../../client/graphql/user';
import {
  Card,
  Grid,
  HelpButton,
  Label,
  Layout,
  Link,
  Page,
  Stack,
  TextStyle,
  TopBar,
  UserSkillsDisplay
} from '../../client/components';
import Tooltip from '../../client/components/basic/Tooltip';
import {
  getBrandNameFromLink,
  getCompanyFromLink
} from '../../client/components/SocialLinkListEditor';
import { resolveQuery } from '../../client/util/graphqlHelpers';
import { userAvatarUrl, teamAvatarUrl } from '../../client/util/profile';
import { resolveSkillTypes } from '../../client/utilities/skills';
import { withApollo } from '../../lib/apollo';
import { UserInfo, ResolvedUserSkill, TeamInfo } from '../../shared/types';
import { isNullOrEmpty } from '../../shared/util/str';

const { publicRuntimeConfig } = getConfig();

function UserPage() {
  const router = useRouter();

  const { data: currentUserData } = useQuery(GET_USER);

  const currentUser = useMemo(
    resolveQuery<UserInfo | null>(currentUserData, 'user', null),
    [currentUserData]
  );

  const { data, loading } = useQuery(GET_USER, {
    variables: { alias: router.query.alias }
  });

  const user = useMemo(resolveQuery<UserInfo | null>(data, 'user', null), [
    data
  ]);

  const fetchCustomTeamSkills = user?.teams
    ?.map((userTeam) => userTeam.team.id)
    .includes(currentUser?.activeTeam);

  const { data: teamData } = useQuery(GET_TEAM, {
    variables: { id: currentUser?.activeTeam },
    skip: !fetchCustomTeamSkills
  });

  const team = useMemo(
    resolveQuery<TeamInfo | undefined>(teamData, 'team', undefined),
    [teamData]
  );

  const skillTypes = resolveSkillTypes(team);

  const [updateUserData] = useMutation(UPDATE_USER_DATA);

  const { data: jobSkillData } = useQuery(GET_USER_SKILLS, {
    variables: { userId: user?.id, type: 'job' },
    skip: !user
  });

  const jobSkills = useMemo(
    resolveQuery<ResolvedUserSkill[]>(jobSkillData, 'userSkills', []),
    [jobSkillData]
  );

  const { data: softSkillData } = useQuery(GET_USER_SKILLS, {
    variables: { userId: user?.id, type: 'soft' },
    skip: !user
  });

  const softSkills = useMemo(
    resolveQuery<ResolvedUserSkill[]>(softSkillData, 'userSkills', []),
    [softSkillData]
  );

  const { data: softwareSkillData } = useQuery(GET_USER_SKILLS, {
    variables: { userId: user?.id, type: 'software' },
    skip: !user
  });

  const softwareSkills = useMemo(
    resolveQuery<ResolvedUserSkill[]>(softwareSkillData, 'userSkills', []),
    [softwareSkillData]
  );

  const pinnedSkillType = user?.pinnedSkillType || 'job';

  async function updatePinnedSkillType(pinnedSkillType: string) {
    await updateUserData({
      variables: { data: { pinnedSkillType } },
      refetchQueries: [
        {
          query: GET_USER,
          variables: { alias: router.query.alias }
        },
        {
          query: GET_USER
        }
      ]
    });
  }

  if (!user && !loading) {
    return (
      <>
        <TopBar />

        <div className="container">
          <div className="block-left"></div>
          <div className="block-center">
            <div className="tile" style={{ marginTop: '70px' }}>
              <div className="extruded-surface lone">
                <h2>No profile found</h2>

                <img
                  className="centered"
                  src="/img/profile-not-found.png"
                  style={{ width: '296px' }}
                />

                <span
                  className="centered"
                  style={{ textAlign: 'center', marginTop: '30px' }}
                >
                  Looks like the profile doesn’t exist, or the URL entered is
                  incorrect.
                </span>

                <Link url={`/dashboard`}>
                  <button
                    className="btn centered"
                    style={{ marginTop: '40px' }}
                  >
                    Back to Tests
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const pageTitle = user?.name
    ? user.name + "'s Tests strength's visualization"
    : 'Tests';

  const pageDesc = user?.about || 'Your strengths visualized';

  const pageImage =
    'https://uploads-ssl.webflow.com/5d99fb0b6e7b4802b40d8ac0/5ea82c867920acc5216eae1e_Tests - Your strengths visualized.png';

  const shareUrl = `${publicRuntimeConfig.RootUri}/user/${user?.alias}`;

  const earliestJobExperience = Math.min.apply(
    null,
    user?.jobExperience?.map((je) => je.startTime || 0) || [0]
  );

  const relativeJobExperienceTime = (startTime?: number) => {
    const pos =
      ((startTime || 0) - earliestJobExperience) /
      (Date.now() - earliestJobExperience);
    return (pos * 0.7 + 0.15) * 100;
  };

  const sortedJobExperience = user?.jobExperience
    ?.slice()
    .sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="title" content={pageTitle} />
        <meta name="description" content={pageDesc} />
        <link rel="image_src" href={pageImage} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={pageImage} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDesc} />
        <meta property="twitter:image" content={pageImage} />
      </Head>

      <TopBar />

      {user && (
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

                <div
                  className={classNames('info', {
                    shareable: user.publicProfile
                  })}
                >
                  {user.publicProfile && (
                    <Dropdown className="share-profile">
                      <DropdownTrigger>
                        <img src="/icons/share.svg" />
                      </DropdownTrigger>
                      <DropdownContent>
                        <div>
                          <a
                            href={`https://twitter.com/share?url=${encodeURIComponent(
                              shareUrl
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img src="/icons/share-twitter.svg" />
                          </a>
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                              shareUrl
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img src="/icons/share-facebook.svg" />
                          </a>
                          <a
                            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                              shareUrl
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img src="/icons/share-linkedin.svg" />
                          </a>
                          <Tooltip tooltip="Copied!" trigger="click">
                            <a
                              className="link"
                              onClick={(evt) => copy(shareUrl)}
                            >
                              <img src="/icons/share-copy.svg" />
                            </a>
                          </Tooltip>
                        </div>
                      </DropdownContent>
                    </Dropdown>
                  )}

                  <h1 className="name">{user.name}</h1>
                  {!isNullOrEmpty(user.location) && (
                    <div className="location">{user.location}</div>
                  )}
                  {user.me && (
                    <Link url={user.alias + '/edit'}>
                      <button className="btn-slim edit-btn">
                        Edit Profile
                      </button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="block-center">
                {!isNullOrEmpty(user.jobExperience) ? (
                  <>
                    <div className="job-experience-timeline">
                      <div className="axis" />
                      <div className="start-marker" />
                      <div className="end-marker" />

                      <div className="avatar-container">
                        {sortedJobExperience?.map((jobExperience, i) => {
                          const userTeam = user.teams?.find(
                            (userTeam) =>
                              userTeam.team.id === jobExperience.team
                          );
                          return (
                            <React.Fragment key={i}>
                              {i < (sortedJobExperience?.length || 0) - 1 ? (
                                <div
                                  className="past-avatar"
                                  style={{
                                    left: `${relativeJobExperienceTime(
                                      jobExperience.startTime
                                    )}%`,
                                    backgroundImage: `url(${teamAvatarUrl(
                                      userTeam?.team
                                    )})`,
                                    backgroundSize: 'cover'
                                  }}
                                />
                              ) : (
                                <div
                                  className="current-avatar"
                                  style={{
                                    left: `${relativeJobExperienceTime(
                                      jobExperience.startTime
                                    )}%`,
                                    backgroundImage: `url(${teamAvatarUrl(
                                      userTeam?.team
                                    )})`,
                                    backgroundSize: 'cover'
                                  }}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                      {sortedJobExperience?.map((jobExperience, i) => (
                        <React.Fragment key={i}>
                          {i < (sortedJobExperience?.length || 0) - 1 ? (
                            <div
                              key={i}
                              className="past-marker"
                              style={{
                                left: `${relativeJobExperienceTime(
                                  jobExperience.startTime
                                )}%`
                              }}
                            />
                          ) : (
                            <div
                              key={i}
                              className="current-marker"
                              style={{
                                left: `${relativeJobExperienceTime(
                                  jobExperience.startTime
                                )}%`
                              }}
                            />
                          )}
                        </React.Fragment>
                      ))}
                      {sortedJobExperience?.map((jobExperience, i) => {
                        const userTeam = user.teams?.find(
                          (team) => team.team.id === jobExperience.team
                        );
                        return (
                          <div
                            key={i}
                            className={classNames('date', { first: i === 0 })}
                            style={{
                              left: `${relativeJobExperienceTime(
                                jobExperience.startTime
                              )}%`
                            }}
                          >
                            <div className="name-hint">
                              {userTeam?.team.name || jobExperience.customName}
                            </div>

                            {new Date(
                              jobExperience.startTime || 0
                            ).getFullYear()}
                          </div>
                        );
                      })}
                      <div className="date today">Today</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="job-experience-placeholder" />
                    {user.me && (
                      <Link url={user.alias + '/edit'}>
                        <button className="btn add-job-experience">
                          Add Job Experience
                        </button>
                      </Link>
                    )}
                  </>
                )}
              </div>

              <div className="block-right">
                <div className="user-personal-stats">
                  <div>
                    <div className="stat">
                      <div className="value">
                        {jobSkills.length +
                          softSkills.length +
                          softwareSkills.length}
                      </div>
                      <div className="name">
                        Total Skills
                        <br />
                        &nbsp;
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="stat">
                      <div className="value">
                        {user.projects?.filter(
                          (p) =>
                            !p.project.draft &&
                            (p.project.endTime || 0) < Date.now()
                        ).length || 0}
                      </div>
                      <div className="name">
                        Completed
                        <br />
                        Projects
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="stat">
                      <div className="value">{softwareSkills.length}</div>
                      <div
                        className="name"
                        style={{ width: '90px', margin: '0 -7.5px' }}
                      >
                        Technical skills
                        <br />
                        under development
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="stat">
                      <div className="value">
                        {user.jobExperience && user.jobExperience?.length > 0
                          ? Math.round(
                              (Date.now() - earliestJobExperience) /
                                (86400000 * 365)
                            )
                          : 0}
                      </div>
                      <div className="name">Total years of experience</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Page>
            <Layout>
              <Layout.Section secondary={true}>
                <Card>
                  <Card.Section>
                    <Stack alignment="center" distribution="equalSpacing">
                      <Label>About Me</Label>

                      {user.me && (
                        <>
                          {user.publicProfile ? (
                            <img
                              className="profile-visibility"
                              src="/icons/profile-public.svg"
                              title="Your profile is public"
                            />
                          ) : (
                            <img
                              className="profile-visibility"
                              src="/icons/profile-private.svg"
                              title="Your profile is private"
                            />
                          )}
                        </>
                      )}
                    </Stack>

                    {!isNullOrEmpty(user.about) ? (
                      <TextStyle>{user.about}</TextStyle>
                    ) : (
                      <TextStyle subdued={true}>
                        {user.me ? (
                          <>
                            Write a simple overview of yourself and what you are
                            doing. Look at it as your elevator pitch to all
                            those who want to know more about you.
                          </>
                        ) : (
                          <>
                            Nothing has been written about them yet. Once the
                            write up is updated, you will be able to see it here
                          </>
                        )}
                      </TextStyle>
                    )}
                  </Card.Section>

                  <Card.Section>
                    <Stack alignment="center" distribution="equalSpacing">
                      <Label>Social & Media blogs</Label>

                      {user.me && (
                        <Link url={user.alias + '/edit'}>
                          <img src="/icons/edit-user.svg" />
                        </Link>
                      )}
                    </Stack>

                    {isNullOrEmpty(user.links) ? (
                      <>
                        {user.me ? (
                          <Stack vertical={true} spacing="tight">
                            <Stack spacing="tight" alignment="center">
                              <img
                                className="brand-icon"
                                src={`/icons/brands/generic.svg`}
                              />

                              <TextStyle subdued={true}>
                                myportfolio.com
                              </TextStyle>
                            </Stack>

                            <Stack spacing="tight" alignment="center">
                              <img
                                className="brand-icon"
                                src={`/icons/brands/linkedin.svg`}
                              />

                              <TextStyle subdued={true}>Linkedin</TextStyle>
                            </Stack>

                            <Stack spacing="tight" alignment="center">
                              <img
                                className="brand-icon"
                                src={`/icons/brands/instagram.svg`}
                              />

                              <TextStyle subdued={true}>Instagram</TextStyle>
                            </Stack>
                          </Stack>
                        ) : (
                          <Stack spacing="tight" alignment="center">
                            <img
                              className="brand-icon"
                              src={`/icons/brands/generic.svg`}
                            />

                            <TextStyle subdued={true}>No links added</TextStyle>
                          </Stack>
                        )}
                      </>
                    ) : (
                      <Stack vertical={true} spacing="tight">
                        {user.links?.map((link, index) => (
                          <Stack key={index} spacing="tight" alignment="center">
                            <img
                              className="brand-icon"
                              src={`/icons/brands/${getBrandNameFromLink(
                                link
                              )}.svg`}
                            />

                            <Link
                              url={'https://' + link}
                              external={true}
                              color="black"
                            >
                              {getCompanyFromLink(link)}
                            </Link>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Card.Section>

                  <Card.Section>
                    <Stack alignment="center" distribution="equalSpacing">
                      <Label>Articles & reference links</Label>

                      {user.me && (
                        <Link url={user.alias + '/edit'}>
                          <img src="/icons/edit-user.svg" />
                        </Link>
                      )}
                    </Stack>

                    {isNullOrEmpty(user.references) ? (
                      <Stack spacing="tight" alignment="center">
                        <span
                          className="brand-icon"
                          style={{
                            backgroundImage: `url(/icons/link.svg)`,
                            backgroundSize: 'fit',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center'
                          }}
                        />

                        <TextStyle subdued={true}>
                          {user.me ? (
                            <>Edit to paste URL</>
                          ) : (
                            <>No links added</>
                          )}
                        </TextStyle>
                      </Stack>
                    ) : (
                      <Stack vertical={true} spacing="tight">
                        {user.references?.map((reference, index) => (
                          <Stack key={index} spacing="tight" alignment="center">
                            <span
                              className="brand-icon"
                              style={{
                                backgroundImage: `url(/icons/link.svg)`,
                                backgroundSize: 'fit',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center'
                              }}
                            />

                            <Link url={reference} external={true} color="black">
                              {reference.length < 22
                                ? reference
                                : reference.substr(0, 25) + '...'}
                            </Link>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Card.Section>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Stack vertical={true}>
                  <Grid equalHeight={true} keepLayout={true} columns="two">
                    {skillTypes
                      .filter(
                        (st) => st.default && st.value === pinnedSkillType
                      )
                      .map((skillType, index) => (
                        <UserSkillsDisplay
                          key={index}
                          user={user}
                          skillType={skillType}
                          scale={1.2}
                          large={true}
                          pinned={skillType.value === pinnedSkillType}
                          onPin={updatePinnedSkillType}
                        />
                      ))}

                    <Stack vertical={true}>
                      {skillTypes
                        .filter(
                          (st) => st.default && st.value !== pinnedSkillType
                        )
                        .map((skillType, index) => (
                          <UserSkillsDisplay
                            key={index}
                            user={user}
                            skillType={skillType}
                            scale={
                              skillType.visualization === 'sector' ? 0.6 : 1.0
                            }
                            onPin={updatePinnedSkillType}
                          />
                        ))}
                    </Stack>
                  </Grid>

                  {skillTypes
                    .filter((st) => !st.default)
                    .map((skillType, index) => (
                      <UserSkillsDisplay
                        key={index}
                        user={user}
                        skillType={skillType}
                        large={true}
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

export default withApollo(UserPage);
