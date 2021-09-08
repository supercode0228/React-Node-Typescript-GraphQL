/**
 * @format
 */

import { useMutation } from '@apollo/react-hooks';
import Link from 'next/link';
import Router from 'next/router';
import React, { useState } from 'react';
import { GET_USER, UPDATE_USER_DATA } from '../../../../graphql/user';
import { UserInfo } from '../../../../../shared/types';
import { teamAvatarUrl, userAvatarUrl } from '../../../../util/profile';
import { classNames } from '../../../../utilities/css';
import { Avatar } from '../../../Avatar';
import { Icon } from '../../../Icon';
import { Popover } from '../../../Popover';
import { Stack } from '../../../Stack';
import { Truncate } from '../../../Truncate';
import styles from './UserMenu.module.scss';

export interface TopBarUserMenuProps {
  /** Current user info */
  userInfo: UserInfo;
}

export function UserMenu({ userInfo }: TopBarUserMenuProps) {
  const [popoverActive, setPopoverActive] = useState(false);

  const [updateUserData, {}] = useMutation(UPDATE_USER_DATA);

  function togglePopover() {
    setPopoverActive((active) => !active);
  }

  async function changeActiveTeam(teamId: string) {
    await updateUserData({
      variables: { data: { activeTeam: teamId } },
      refetchQueries: [
        {
          query: GET_USER
        }
      ]
    });

    const newActiveTeam = userInfo?.teams?.find(
      (userTeam) => userTeam.team.id === teamId
    );

    Router.push(`/team/${newActiveTeam?.team.alias}`);
  }

  const className = classNames(
    styles.Activator,
    popoverActive && styles['Activator-active']
  );

  const activeTeam = userInfo?.teams?.find(
    (userTeam) => userTeam.team.id === userInfo?.activeTeam
  );

  const activator = (
    <a className={className} onClick={togglePopover}>
      <Stack spacing="extraTight" alignment="center">
        <Avatar
          url={userAvatarUrl(userInfo)}
          child={activeTeam && teamAvatarUrl(activeTeam.team)}
        />

        <Icon source="chevronDown" size="small" color="white" />
      </Stack>
    </a>
  );

  return (
    <div className={styles.UserMenu}>
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={togglePopover}
      >
        <div className={styles.Content}>
          <div className={styles.Header}>
            <Link href={'/user/' + userInfo.alias}>
              <a>View profile</a>
            </Link>
          </div>

          <div className={styles.Section}>
            <p className={styles.SectionTitle}>Switch team</p>

            <Stack vertical={true} spacing="tight">
              {userInfo.teams?.map((userTeam, index) => (
                <a
                  key={index}
                  onClick={() => changeActiveTeam(userTeam.team.id || '')}
                  style={{
                    color:
                      userTeam.team.id === userInfo.activeTeam ? '#000' : '#888'
                  }}
                >
                  <Stack wrap={false} spacing="extraTight" alignment="center">
                    <Avatar
                      url={teamAvatarUrl(userTeam.team)}
                      border={true}
                      size="small"
                    />

                    <Stack.Item fill={true}>
                      <Truncate>{userTeam.team.name}</Truncate>
                    </Stack.Item>
                  </Stack>
                </a>
              ))}

              <Link href={'/team'}>
                <a>
                  <Stack spacing="extraTight" alignment="center">
                    <img src="/icons/team-new.svg" />

                    <span>Create a team</span>
                  </Stack>
                </a>
              </Link>
            </Stack>
          </div>

          <div className={styles.Footer}>
            <Stack
              spacing="extraTight"
              alignment="center"
              distribution="equalSpacing"
            >
              <Link href={'/logout'}>
                <a>Log Out</a>
              </Link>

              <Link href={`/user/${userInfo.alias}/settings`}>
                <a>Settings</a>
              </Link>
            </Stack>
          </div>
        </div>
      </Popover>
    </div>
  );
}
