/**
 * @format
 */

import '../../app.scss';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';
import {
  ActionList,
  Card,
  Disclosure,
  HelpButton,
  Popover,
  Stack,
  Subheading,
  TopBar
} from '../../../client/components';
import ProjectTile from '../../../client/components/ProjectTile';
import {
  GET_TEAM_PROJECTS,
  REMOVE_PROJECT,
  REMOVE_PROJECT_MEMBER
} from '../../../client/graphql/project';
import { GET_TEAM } from '../../../client/graphql/team';
import { GET_USER } from '../../../client/graphql/user';
import { ensureAccess } from '../../../client/util/accessControl';
import { resolveQuery } from '../../../client/util/graphqlHelpers';
import { teamAvatarUrl } from '../../../client/util/profile';
import { withApollo } from '../../../lib/apollo';
import { TeamInfo, UserInfo, TeamProjectInfo } from '../../../shared/types';

const TeamProjectsPage = () => {
  const router = useRouter();

  const { data: userData } = useQuery(GET_USER);
  const userInfo = useMemo(
    resolveQuery<UserInfo | null>(userData, 'user', null),
    [userData]
  );

  const { data, error } = useQuery(GET_TEAM, {
    variables: { alias: router.query.alias }
  });

  ensureAccess(error);

  const teamInfo = useMemo(resolveQuery<TeamInfo | null>(data, 'team', null), [
    data
  ]);

  const [filterPopoverActive, setFilterPopoverActive] = useState(false);
  const [filterValue, setFilterValue] = useState('all');
  const [query, setQuery] = useState('');

  const { data: teamProjectsData, loading } = useQuery(GET_TEAM_PROJECTS, {
    variables: { id: teamInfo?.id },
    skip: !teamInfo
  });

  const teamProjects = useMemo(
    resolveQuery<TeamProjectInfo[] | null>(
      teamProjectsData,
      'teamProjects',
      null
    ),
    [teamProjectsData]
  );

  let filteredTeamProjects = teamProjects;

  if (teamProjects && filterValue === 'mine') {
    filteredTeamProjects = teamProjects.filter(
      (teamProject) =>
        teamProject.project.creator?.id?.toString() === userInfo?.id ||
        teamProject.project.users
          ?.map((projectUser) => projectUser.user.id?.toString())
          .includes(userInfo?.id)
    );
  }

  const [removeProject, {}] = useMutation(REMOVE_PROJECT);
  const [removeProjectMember, {}] = useMutation(REMOVE_PROJECT_MEMBER);

  const createProject = async () => {
    Router.push(`/project/new/edit?team=${teamInfo?.id}`);
  };

  const onRemoveProject = async (id: string) => {
    await removeProject({
      variables: { id },
      refetchQueries: [
        {
          query: GET_TEAM_PROJECTS,
          variables: { id: teamInfo?.id }
        }
      ]
    });
  };

  const leaveProject = async (projectId: string) => {
    await removeProjectMember({
      variables: { projectId, userId: userInfo?.id },
      refetchQueries: [
        {
          query: GET_TEAM_PROJECTS,
          variables: { id: teamInfo?.id }
        }
      ]
    });
  };

  function toggleFilterPopover() {
    setFilterPopoverActive((active) => !active);
  }

  const filterOptions = [
    {
      value: 'all',
      label: 'Showing all projects'
    },
    {
      value: 'mine',
      label: 'Only mine'
    }
  ];

  const selectedFilterLabel = filterOptions.find(
    (filterOption) => filterOption.value === filterValue
  )?.label;

  const headsupProjects: TeamProjectInfo[] = [];
  const draftProjects: TeamProjectInfo[] = [];
  const ongoingProjects: TeamProjectInfo[] = [];
  const previousProjects: TeamProjectInfo[] = [];

  filteredTeamProjects
    ?.filter((teamProject) =>
      query.length > 0
        ? teamProject.project.name.toLowerCase().includes(query.toLowerCase())
        : true
    )
    .forEach((teamProject) => {
      if (teamProject.project.draft) {
        draftProjects.push(teamProject);
      } else if (
        teamProject.project.startTime &&
        teamProject.project.startTime > Date.now()
      ) {
        headsupProjects.push(teamProject);
      } else if (
        teamProject.project.startTime &&
        teamProject.project.endTime &&
        teamProject.project.startTime <= Date.now() &&
        teamProject.project.endTime >= Date.now()
      ) {
        ongoingProjects.push(teamProject);
      } else {
        previousProjects.push(teamProject);
      }
    });

  if (teamInfo && (teamProjects?.length || 0) < 1 && !loading) {
    return (
      <>
        <Head>
          <title>{`${teamInfo?.name}'s projects`}</title>
        </Head>
        <TopBar />
        <div className="container">
          <div className="block-left"></div>
          <div className="block-center">
            <div className="tile" style={{ marginTop: '70px' }}>
              <div className="extruded-surface lone no-projects">
                <div className="team-info">
                  <div
                    className="avatar"
                    style={{
                      backgroundImage: `url(${teamAvatarUrl(teamInfo)})`,
                      backgroundSize: 'cover'
                    }}
                  />
                  <div className="name">{teamInfo.name}</div>
                </div>

                <h2>No projects yet</h2>

                <img
                  className="centered"
                  src="/img/no-projects.png"
                  style={{ width: '248px' }}
                />

                <span
                  className="centered"
                  style={{ textAlign: 'center', marginTop: '30px' }}
                >
                  It’s time to create your first project team.{' '}
                  <br className="desktop" />
                  Choose the skills you need and find the{' '}
                  <br className="desktop" />
                  right people for the project
                </span>

                <a className="link" onClick={() => createProject()}>
                  <button
                    className="btn centered"
                    style={{ marginTop: '40px' }}
                  >
                    Create a project
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <HelpButton />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${teamInfo?.name}'s projects`}</title>
      </Head>
      <IntlProvider locale="en">
        <TopBar />
        {teamInfo && filteredTeamProjects && (
          <>
            <div className="medium-container team-projects top-padded">
              <div className="tile">
                <Card>
                  <Card.Header>
                    <Stack distribution="equalSpacing" alignment="center">
                      <Subheading>Project stats</Subheading>

                      <Popover
                        active={filterPopoverActive}
                        activator={
                          <Disclosure
                            label={selectedFilterLabel}
                            onClick={toggleFilterPopover}
                          />
                        }
                        onClose={toggleFilterPopover}
                      >
                        <ActionList
                          items={filterOptions.map((filterOption) => {
                            return {
                              content: filterOption.label,
                              active: filterOption.value === filterValue,
                              onClick: () => setFilterValue(filterOption.value)
                            };
                          })}
                          onClickAnyItem={toggleFilterPopover}
                        />
                      </Popover>
                    </Stack>
                  </Card.Header>

                  <Card.Section>
                    <div className="projects-stats">
                      <div>
                        <div className="stat">
                          <img
                            className="icon"
                            src="/icons/projects-total.svg"
                          />
                          <div className="value">
                            {filteredTeamProjects.length}
                          </div>
                          <div className="name">Total</div>
                        </div>
                      </div>
                      <div>
                        <div className="stat">
                          <img
                            className="icon"
                            src="/icons/projects-ongoing.svg"
                          />
                          <div className="value">
                            {
                              filteredTeamProjects.filter(
                                (teamProject) =>
                                  !teamProject.project.draft &&
                                  (teamProject.project.startTime || 0) <
                                    Date.now() &&
                                  (teamProject.project.endTime || 0) >
                                    Date.now()
                              ).length
                            }
                          </div>
                          <div className="name">Ongoing</div>
                        </div>
                      </div>
                      <div>
                        <div className="stat">
                          <img
                            className="icon"
                            src="/icons/projects-completed.svg"
                          />
                          <div className="value">
                            {
                              filteredTeamProjects.filter(
                                (teamProject) =>
                                  !teamProject.project.draft &&
                                  teamProject.project.endTime &&
                                  (teamProject.project.endTime || 0) <
                                    Date.now()
                              ).length
                            }
                          </div>
                          <div className="name">Completed</div>
                        </div>
                      </div>
                      <div>
                        <div className="stat">
                          <img
                            className="icon"
                            src="/icons/projects-draft.svg"
                          />
                          <div className="value">
                            {
                              filteredTeamProjects.filter(
                                (teamProject) => teamProject.project.draft
                              ).length
                            }
                          </div>
                          <div className="name">In draft</div>
                        </div>
                      </div>
                    </div>
                  </Card.Section>
                </Card>
              </div>

              <div className="tile">
                <div className="extruded-surface medium">
                  <div className="input-group search">
                    <img className="icon" src="/icons/search.svg" />
                    <input
                      type="text"
                      value={query}
                      onChange={(evt) => setQuery(evt.target.value)}
                      placeholder="Search for project"
                    />
                    <div
                      className="team-avatar"
                      style={{
                        backgroundImage: `url(${teamAvatarUrl(teamInfo)})`,
                        backgroundSize: 'cover'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="tile">
                <a
                  className="link create-project-btn"
                  onClick={(evt) => createProject()}
                >
                  <button className="btn-small edit-btn">
                    Create a project
                  </button>
                </a>
              </div>

              {headsupProjects.length > 0 && (
                <div className="tile">
                  <div className="extruded-surface project-group headsup">
                    <div className="title">
                      <img src="/icons/bell-red.svg" />
                      <span>Heads up</span>
                    </div>
                    {headsupProjects.map((p, i) => (
                      <ProjectTile key={i} data={p} />
                    ))}
                  </div>
                </div>
              )}
              {draftProjects.length > 0 && (
                <div className="tile">
                  <div className="extruded-surface project-group draft">
                    <div className="title">
                      <img src="/icons/edit.svg" />
                      <span>({draftProjects.length}) Draft project/s</span>
                    </div>
                    {draftProjects.map((p, i) => (
                      <ProjectTile
                        key={i}
                        data={p}
                        onRemove={onRemoveProject.bind(
                          null,
                          p.project.id || ''
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {ongoingProjects.length > 0 && (
                <>
                  <div className="tile">
                    <div className="extruded-surface project-group other">
                      <div className="body-spacer inner">
                        <div className="title">
                          ({ongoingProjects.length}) Ongoing project/s
                        </div>
                        <div className="spacer" />
                      </div>
                      <div style={{ clear: 'both' }} />

                      {ongoingProjects.map((p, i) => (
                        <ProjectTile
                          key={i}
                          data={p}
                          onLeaveProject={leaveProject}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
              {previousProjects.length > 0 && (
                <>
                  <div className="tile">
                    <div className="extruded-surface project-group other">
                      <div className="body-spacer inner">
                        <div className="title">
                          ({previousProjects.length}) Previous project/s
                        </div>
                        <div className="spacer" />
                      </div>
                      <div style={{ clear: 'both' }} />

                      {previousProjects.map((p, i) => (
                        <ProjectTile key={i} data={p} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </IntlProvider>

      <HelpButton />
    </>
  );
};

export default withApollo(TeamProjectsPage);
