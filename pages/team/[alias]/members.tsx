import { withApollo } from '../../../lib/apollo';
import React, { useEffect, useState, useRef, useMemo, useLayoutEffect } from 'react';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';

import Modal from 'react-modal';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

import { useDebouncedCallback } from 'use-debounce/lib';
import classNames from 'classnames';

import '../../app.scss';
import { resolveQuery } from '../../../client/util/graphqlHelpers';
import { GET_TEAM, GET_TEAM_MEMBERS, CANCEL_TEAM_INVITE, UPDATE_TEAM_MEMBER, REMOVE_TEAM_MEMBER } from '../../../client/graphql/team';
import { ActionList, Avatar, ForceTreeChart, Header, Heading, HelpButton, Icon, Input, Popover, Radio, Slider, Stack, Tabs, TeamNavigation, TopBar } from '../../../client/components';
import { TeamInfo, UserTeamInfo, UserInfo } from '../../../shared/types';
import TeamInviteDialog from '../../../client/components/TeamInviteDialog';
import TeamHeader from '../../../client/components/TeamHeader';
import { ensureAccess } from '../../../client/util/accessControl';
import { GET_USER } from '../../../client/graphql/user';
import { strCompare, maybeClipStr } from '../../../shared/util/str';
import { teamAvatarUrl, userAvatarUrl } from '../../../client/util/profile';
import { resolveSkillAreas } from '../../../client/utilities/skills';

const TeamMembersPage = () => {
  const router = useRouter();
  const client = useApolloClient();

  const MAXZOOM = 300;

  // FIXME: should only be viewable by the team members

  const { data, error } = useQuery(GET_TEAM, {
    variables: { alias: router.query.alias },
    fetchPolicy: "network-only",
  });
  ensureAccess(error);
  const teamInfo = useMemo(resolveQuery<TeamInfo | null>(data, 'team', null), [data]);

  const skillAreas = resolveSkillAreas(teamInfo);

  const [ skillArea, setSkillArea ] = useState<string | undefined>((router.query.skillArea as string) || undefined);
  const [ textFilter, setTextFilter ] = useState('');
  const [ textFilterDelayed, setTextFilterDelayed ] = useState('');
  const [ setTextFilterDebounced, ] = useDebouncedCallback(setTextFilterDelayed, 500);

  const sortFields = [
    { name: 'name', label: 'Name' },
    { name: 'jobTitle', label: 'Job Title' },
    { name: 'role', label: 'Role' },
  ];
  const viewOptions = [
    { name: 'grid', label: 'Grid', icon: <Icon source="grid" />},
    { name: 'hirency', label: 'Hirency', icon: <Icon source="hirency" />},
  ];
  const chartViewOptions = [
    { name: 'name', label: 'Name' },
    { name: 'department', label: 'Department' },
    { name: 'title', label: 'Title' },
    { name: 'topSkill', label: 'Top skill'},
    { name: 'project', label: 'Project' }
  ] 

  const [ sortBy, setSortBy ] = useState({ ...sortFields[0], order: 1 });
  const [ viewBy, setViewBy ] = useState(viewOptions[0]);
  const [ zoomValue, setZoomValue ] = useState({value: 100, active: true});
  const [ chartViewBy, setChartViewBy] = useState(chartViewOptions[0].name);

  const updateTextFilter = (val : string) => {
    setTextFilter(val);
    setTextFilterDebounced(val);
  };

  const { data: teamData } = useQuery(GET_TEAM_MEMBERS, {
    variables: { alias: router.query.alias, skillArea, textFilter: textFilterDelayed },
    fetchPolicy: "network-only",
  });
  const teamMembers = useMemo(resolveQuery<UserTeamInfo[] | null>(teamData, 'teamMembers', []), [teamData]);
  const [ cancelTeamInvite, { } ] = useMutation(CANCEL_TEAM_INVITE);
  const [ updateTeamMember, { } ] = useMutation(UPDATE_TEAM_MEMBER);
  const [ removeTeamMember, { } ] = useMutation(REMOVE_TEAM_MEMBER);

  const [sortPopoverActive, setSortPopoverActive] = useState(false);
  const [viewPopoverActive, setViewPopoverActive] = useState(false);
  const [depPopoverActive, setDepPopoverActive] = useState(false);

  function toggleSortPopover() {
    setSortPopoverActive((active) => !active);
  }

  function toggleViewPopover() {
    setViewPopoverActive((active) => !active);
  }

  function toggleDepPopover() {
    setDepPopoverActive((active) => !active);
  }

  function handleZoom(value: number, active: boolean) {
    setZoomValue({value, active});
  }

  function handleChartView(value: string) {
    setChartViewBy(value);
  }

  const cancelInvite = async (key : string) => {
    await cancelTeamInvite({
      variables: { key },
      refetchQueries: [
        {
          query: GET_TEAM,
          variables: { alias: router.query.alias },
        },
      ],
      // awaitRefetchQueries: true,
    });
    // client.resetStore();
  };

  const changeMemberRole = async (id : string, role : string, external : boolean = false) => {
    await updateTeamMember({
      variables: { data: { teamId: teamInfo?.id, id, role, external } },
      refetchQueries: [
        {
          query: GET_TEAM_MEMBERS,
          variables: { alias: router.query.alias, skillArea, textFilter: textFilterDelayed },
        },
      ],
    });
    // client.resetStore();
  };
  const removeMember = async (id : string) => {
    await removeTeamMember({
      variables: { teamId: teamInfo?.id, userId: id },
      refetchQueries: [
        {
          query: GET_TEAM_MEMBERS,
          variables: { alias: router.query.alias, skillArea, textFilter: textFilterDelayed },
        },
      ],
    });
    // client.resetStore();
  };

  const teamMemberList = (members : UserTeamInfo[]) => {
    return (
      <>
      {members?.map((u, i) =>
        <div key={i} className="user-tile">
          <div className="team-user">
            {u.user.me &&
              <div className="role-indicator">You</div>
            }
            {(!u.user.me && u.role === 'owner') &&
              <div className="role-indicator">Own</div>
            }
            {(!u.user.me && u.role === 'admin') &&
              <div className="role-indicator">Adm</div>
            }
            <div
              className="avatar"
              style={{
                backgroundImage: `url(${userAvatarUrl(u.user)})`,
                backgroundSize: 'cover'
              }}
            />
            <Link href={`/user/${u.user.alias}`}>
              <a><div className="name">{u.user.name}</div></a>
            </Link>
            <div className="job-title">{maybeClipStr(u.user.jobTitle, 25)}</div>
            {(!u.user.me && (teamInfo?.myRole === 'owner' || teamInfo?.myRole === 'admin')) &&
              <div className="edit">
                <Dropdown>
                  <DropdownTrigger>
                    <img src="/icons/edit-user.svg" />
                  </DropdownTrigger>
                  <DropdownContent>
                    <ul>
                      <li>
                        <a className={classNames("link", { active: u.role === 'member' })} onClick={evt => changeMemberRole(u.user.id || '', 'member')}>
                          Team member
                        </a>
                      </li>
                      <li>
                        <a className={classNames("link", "sub", { active: u.role === 'member' && !u.external })} onClick={evt => changeMemberRole(u.user.id || '', 'member')}>
                          Internal
                        </a>
                      </li>
                      <li>
                        <a className={classNames("link", "sub", { active: u.role === 'member' && u.external })} onClick={evt => changeMemberRole(u.user.id || '', 'member', true)}>
                          External
                        </a>
                      </li>
                      <li>
                        <a className={classNames("link", { active: u.role === 'admin' })} onClick={evt => changeMemberRole(u.user.id || '', 'admin')}>
                          Admin
                        </a>
                      </li>
                      <li>
                        <div className="spacer" />
                      </li>
                      <li>
                        <a className="link" onClick={evt => removeMember(u.user.id || '')} style={{ fontSize: '12px' }}>
                          REMOVE
                        </a>
                      </li>
                    </ul>
                  </DropdownContent>
                </Dropdown>
              </div>
            }
          </div>
        </div>
      )}
      <div style={{ clear: 'both' }} />
      </>
    );
  }

  const filtersApplied = skillArea || textFilterDelayed !== '';

  const allSkillAreas = [
    { value: undefined, label: `${viewBy.name === 'grid' ? 'All' : 'All Departments'}` },
    ...skillAreas,
  ];

  const getField = (x : UserTeamInfo, field : string) => {
    if(field === 'role')
      return (x as any)[field];
    return (x.user as any)[field];
  };
  const internalTeamMembers = (teamMembers || [])
    .filter(m => !m.external)
    .slice();
  internalTeamMembers.sort((a, b) => strCompare(getField(a, sortBy.name), getField(b, sortBy.name), sortBy.order));
  const externalTeamMembers = (teamMembers || [])
    .filter(m => m.external)
    .slice();
  externalTeamMembers.sort((a, b) => strCompare(getField(a, sortBy.name), getField(b, sortBy.name), sortBy.order));

  return (
    <>
      <Head>
        <title>{teamInfo?.name + " on Tests"}</title>
      </Head>
      <TopBar />
      {teamInfo && (
        <>
      <Header>
        <Header.Section>
          <Stack wrap={false} alignment="center">
            <Stack.Item>
              <Avatar
                url={teamAvatarUrl(teamInfo)}
                border={true}
                size="large"
              />
            </Stack.Item>

            <Stack.Item fill={true}>
              <Stack vertical={true} spacing="tight">
                <Link href={`/team/${teamInfo.alias}`}>
                  <a>
                    <Heading>{teamInfo.name}</Heading>
                  </a>
                </Link>

                {['owner', 'admin'].includes(teamInfo.myRole as string) && (
                  <Link href={`/team/${teamInfo.alias}/settings`}>
                    <a>
                      <button className="btn-slim edit-btn">
                        Edit team
                      </button>
                    </a>
                  </Link>
                )}
              </Stack>
            </Stack.Item>
          </Stack>
        </Header.Section>

        <Header.Section fill={true}>
          <TeamNavigation team={teamInfo} />
        </Header.Section>
      </Header>

      <Header slim={true}>
        {
          viewBy.name === 'grid' && (
            <Header.Section fill={true} spacing="none">
              <Tabs
                items={allSkillAreas.map((sa) => ({
                  content: sa.label,
                  active: sa.value === skillArea,
                  onClick: () => setSkillArea(sa.value)
                }))}
              />
            </Header.Section>
          )
        }
        {
          viewBy.name === 'hirency' && (
            <Header.Section fill={true} spacing="loose">
              <Stack spacing="loose" distribution="equalSpacing">
                <Stack spacing="none">
                  <Popover
                    active={depPopoverActive}
                    activator={
                      <div
                        className="team-member-departments"
                        onClick={toggleDepPopover}
                      >
                        {skillArea ? skillArea : allSkillAreas[0].label}
                        &nbsp;&nbsp;
                        <Icon source="chevronDownSmall" />
                      </div>
                    }
                    onClose={toggleDepPopover}
                  >
                    <ActionList
                      items={allSkillAreas.map((sa) => {
                        return {
                          content: sa.label,
                          active: sa.value === skillArea,
                          onClick: () => setSkillArea(sa.value)
                        };
                      })}
                      onClickAnyItem={toggleDepPopover}
                    />
                  </Popover>
                </Stack>
                <Stack alignment="center" spacing="none">
                  {zoomValue.value < MAXZOOM / 2 ? (
                    <Icon source="detailBlack" />
                  ) : (
                    <Icon source="detailGrey" />
                  )}
                  <Slider
                    zoom={zoomValue}
                    onChange={handleZoom}
                  />
                  {zoomValue.value < MAXZOOM / 2 ? (
                    <Icon source="overviewGrey" />
                  ) : (
                    <Icon source="overviewBlack" />
                  )}
                </Stack>
              </Stack>
            </Header.Section>
          )
        }

        <Header.Section>
          <Input
            placeholder='Search Members'
            value={textFilter}
            appearance="border"
            prefix={<img width={14} height={14} src="/icons/search.svg" />}
            onChange={value => updateTextFilter(value)}
          />
        </Header.Section>

        <Header.Section>
          <Stack distribution="equalSpacing" alignment="center">
            <Stack spacing="tight" alignment="center">
              <span>Sort by</span>

              <Popover
                active={sortPopoverActive}
                activator={
                  <a onClick={toggleSortPopover}>{sortBy.label}</a>
                }
                onClose={toggleSortPopover}
              >
                <ActionList
                  items={sortFields.map((sf) => {
                    return {
                      content: sf.label,
                      active: sf.name === sortBy.name,
                      onClick: () => setSortBy({ ...sf, order: sortBy.order })
                    };
                  })}
                  onClickAnyItem={toggleSortPopover}
                />
              </Popover>

              {sortBy.order > 0 ?
                <a onClick={() => setSortBy({ ...sortBy, order: -1 })}><img src="/icons/arrow-up.svg" /></a>
              :
                <a onClick={() => setSortBy({ ...sortBy, order: 1 })}><img src="/icons/arrow-down.svg" /></a>
              }
            </Stack>
            
            <Stack alignment="center">
              <Popover
                active={viewPopoverActive}
                activator={
                  <a className="team-member-view" onClick={toggleViewPopover}>
                    {viewBy.icon}
                    <Icon source="chevronDownSmall" />
                  </a>
                }
                onClose={toggleViewPopover}
              >
                <ActionList
                  items={viewOptions.map((vp) => {
                    const content = (
                      <div className="team-member-view-item">
                        {vp.icon}&nbsp;&nbsp;{vp.label}
                      </div>
                    );

                    return {
                      content,
                      active: vp.name === viewBy.name,
                      onClick: () => setViewBy(vp)
                    };
                  })}
                  onClickAnyItem={toggleViewPopover}
                />
              </Popover>
            </Stack>
          </Stack>
        </Header.Section>
      </Header>
      </>
      )}

      {(teamInfo && teamMembers) && (viewBy.name === 'grid' ?
      <>
        <div className="slim-container">
          {((teamInfo.invites?.length || 0) > 0 && !filtersApplied) &&
            <div className="body-spacer">
              <div className="title">Pending invites</div>
              <div className="spacer" />
            </div>
          }
          <div style={{ clear: 'both' }} />
          {!filtersApplied && teamInfo.invites?.map((inv, i) =>
            <div key={i} className="user-tile">
              <div className="team-user">
                <div
                  className="avatar"
                  style={{
                    backgroundImage: `url(${userAvatarUrl(inv.user)})`,
                    backgroundSize: 'cover'
                  }}
                />
                {inv.user ?
                  <>
                    <div className="name">{inv.user.name}</div>
                    <div className="job-title">{maybeClipStr(inv.user.jobTitle, 25)}</div>
                  </>
                :
                  <>
                    <div className="email">{inv.email}</div>
                  </>
                }
                <div className="edit">
                  <Dropdown>
                    <DropdownTrigger>
                      <img src="/icons/edit-user.svg" />
                    </DropdownTrigger>
                    <DropdownContent>
                      <ul>
                        <li>
                          <a className="link" onClick={evt => cancelInvite(inv.key)}>Cancel</a>
                        </li>
                      </ul>
                    </DropdownContent>
                  </Dropdown>
                </div>
              </div>
            </div>
          )}
          <div style={{ clear: 'both' }} />


          <div className="body-spacer">
            <div className="title">Internal</div>
            <div className="spacer" />
          </div>
          <div style={{ clear: 'both' }} />

          {teamMemberList(internalTeamMembers)}

          {externalTeamMembers.length > 0 &&
          <>
            <div className="body-spacer">
              <div className="title">External</div>
              <div className="spacer" />
            </div>
            <div style={{ clear: 'both' }} />

            {teamMemberList(externalTeamMembers)}
          </>
          }
        </div>

        <HelpButton />
      </> :
      <div>
        <ForceTreeChart
          data={teamMembers}
          zoomValue={zoomValue}
          viewBy={chartViewBy}
          handleZoomSlider={handleZoom}
        />
        <div className="team-member-view-options">
          <Stack distribution="equalSpacing">
            <Stack.Item>
              <Heading>View</Heading>
            </Stack.Item>
            <Stack.Item fill={true}>
              <Stack distribution="equalSpacing" spacing="tight" >
                {chartViewOptions.map(item => (
                  <Radio
                    active={item.name === chartViewBy}
                    name={item.name}
                    title={item.label}
                    vertical={true}
                    onClick={handleChartView}
                  />
                ))}
              </Stack>
            </Stack.Item>
          </Stack>
        </div>
      </div>
      )}
    </>
  );
}

export default withApollo(TeamMembersPage);
