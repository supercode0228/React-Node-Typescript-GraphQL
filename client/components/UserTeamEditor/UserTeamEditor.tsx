/**
 * @format
 */

import { useQuery, useMutation } from '@apollo/react-hooks';
import React, { useEffect, useRef, useState, useMemo } from 'react';

import {
  Avatar,
  ActionList,
  Card,
  Disclosure,
  Form,
  Label,
  Link,
  Popover,
  Select,
  Stack,
  Subheading,
  TextStyle,
  Truncate,
  Tag,
  UserList
} from '../../components';

import {
  GET_TEAM_MEMBERS,
  REMOVE_TEAM_MEMBER
} from '../../../client/graphql/team';
import { UPDATE_USER_TEAM_MUTATION } from '../../../client/graphql/user';
import { resolveQuery } from '../../../client/util/graphqlHelpers';

import { UserTeamInfo } from '../../../shared/types';
import { teamAvatarUrl, userAvatarUrl } from '../../util/profile';

export interface UserTeamEditorProps {
  /** User team */
  userTeam: UserTeamInfo;
  /** User ID */
  userId: string;
  /** Active team */
  activeTeam?: string;
  /** Callback when the user leaves the team */
  onTeamLeave: () => void;
}

export function UserTeamEditor({
  userTeam,
  userId,
  activeTeam,
  onTeamLeave
}: UserTeamEditorProps) {
  const { data: teamData } = useQuery(GET_TEAM_MEMBERS, {
    variables: { id: activeTeam },
    fetchPolicy: 'network-only'
  });
  const teamMembers = useMemo(
    resolveQuery<UserTeamInfo[] | null>(teamData, 'teamMembers', []),
    [teamData]
  );

  const [updateUserTeam] = useMutation(UPDATE_USER_TEAM_MUTATION);
  const [removeTeamMember] = useMutation(REMOVE_TEAM_MEMBER);

  const [directManager, setDirectManager] = useState<string[] | []>(
    userTeam.directManager || []
  );

  const [skillArea, setSkillArea] = useState<string | undefined>(
    userTeam.skillArea
  );

  const [location, setLocation] = useState<string | undefined>(
    userTeam.location
  );

  const [editing, setEditing] = useState<boolean>(
    userTeam.team.id === activeTeam
  );

  const [popoverActive, setPopoverActive] = useState<boolean>(false);
  const [dmPopoverActive, setDMPopoverActive] = useState<boolean>(false);

  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;

      return;
    }

    update();
  }, [skillArea, location, directManager]);

  useEffect(() => {
    setDMPopoverActive(false);
  }, [directManager]);

  function togglePopover() {
    setPopoverActive((active) => !active);
  }

  function toggleDMPopover() {
    setDMPopoverActive((active) => !active);
  }

  function toggleEditing() {
    setEditing((editing) => !editing);
  }

  function handleDirectManager(value: string) {
    const hasIndex = directManager.findIndex((el) => el === value);
    if (hasIndex > -1) {
      directManager.splice(hasIndex, 1);
      setDirectManager([...directManager]);
    } else {
      setDirectManager([...directManager, value]);
    }
  }

  async function update() {
    await updateUserTeam({
      variables: {
        input: {
          teamId: userTeam.team.id,
          skillArea,
          location,
          directManager
        }
      }
    });
  }

  async function leaveTeam() {
    await removeTeamMember({
      variables: { teamId: userTeam.team.id, userId }
    });

    onTeamLeave();
  }

  return (
    <Card>
      <Card.Section>
        <Stack wrap={false} spacing="tight" alignment="center">
          <Stack.Item>
            <Avatar
              url={teamAvatarUrl(userTeam.team)}
              border={true}
              role={userTeam.role}
            />
          </Stack.Item>

          <Stack.Item fill={true}>
            <Subheading>
              <Truncate>{userTeam.team.name}</Truncate>
            </Subheading>
          </Stack.Item>

          <Stack.Item>
            <Popover
              active={popoverActive}
              activator={<Disclosure onClick={togglePopover} />}
              onClose={togglePopover}
            >
              <ActionList
                sections={[
                  {
                    items: [
                      {
                        content: 'View team page',
                        url: `/team/${userTeam.team.alias}`
                      },
                      {
                        content: 'View team projects',
                        url: `/team/${userTeam.team.alias}/projects`
                      }
                    ]
                  },
                  {
                    items: [
                      {
                        content: editing ? 'Collapse' : 'Expand',
                        onClick: toggleEditing
                      },
                      {
                        content: 'Team settings',
                        url: `/team/${userTeam.team.alias}/settings`,
                        hidden: userTeam.role === 'member'
                      },
                      {
                        content: '👋 Leave team',
                        onClick: leaveTeam,
                        hidden: userTeam.role === 'owner'
                      }
                    ]
                  }
                ]}
                onClickAnyItem={togglePopover}
              />
            </Popover>
          </Stack.Item>
        </Stack>
      </Card.Section>

      {editing && (
        <Card.Section>
          <Form>
            <Stack>
              <Stack.Item fill={true}>
                <Label>Your Direct Manager</Label>
              </Stack.Item>

              <Stack.Item>
                <Popover
                  active={dmPopoverActive}
                  activator={
                    <div>
                      <Link color="blue" onClick={toggleDMPopover}>
                        + ADD
                      </Link>
                    </div>
                  }
                  noBorder={true}
                  onClose={toggleDMPopover}
                >
                  <UserList
                    items={teamMembers?.map((tm) => {
                      const item = {
                        id: tm.user.id || '',
                        avatar: userAvatarUrl(tm.user) || '',
                        name: tm.user.name || '',
                        jobTitle: tm.user.jobTitle || '',
                        onClick: handleDirectManager
                      };
                      return item;
                    })}
                  />
                </Popover>
              </Stack.Item>
              <Stack.Item>
                <Stack vertical={true}>
                  {directManager.length > 0 ? (
                    <Stack spacing="extraTight">
                      {directManager.map((dm, index) => {
                        const member = teamMembers?.find(
                          (tm) => tm.user.id === dm
                        );
                        return (
                          <Tag
                            key={index}
                            color="blue"
                            onRemove={() => handleDirectManager(dm)}
                          >
                            <Avatar
                              url={userAvatarUrl(member?.user)}
                              border={true}
                              size="extraSmall"
                            />
                            <span>&nbsp;&nbsp;{member?.user.name}</span>
                          </Tag>
                        );
                      })}
                    </Stack>
                  ) : (
                    <TextStyle>No manager added</TextStyle>
                  )}
                </Stack>
              </Stack.Item>
            </Stack>
            <Select
              label="Your Department"
              placeholder="Select your department"
              value={skillArea}
              options={userTeam.team.skillAreas?.map((skillArea) => ({
                label: skillArea,
                value: skillArea
              }))}
              onChange={(skillArea) => setSkillArea(skillArea)}
            />

            <Select
              label="Location"
              placeholder="Select your location"
              value={location}
              options={userTeam.team.locations?.map((location) => ({
                label: location,
                value: location
              }))}
              onChange={(location) => setLocation(location)}
            />
          </Form>
        </Card.Section>
      )}
    </Card>
  );
}
