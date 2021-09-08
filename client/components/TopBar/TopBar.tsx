/**
 * @format
 */

import { useQuery } from '@apollo/react-hooks';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { UserInfo } from '../../../shared/types';
import { GET_USER } from '../../graphql/user';
import { resolveQuery } from '../../util/graphqlHelpers';
import {
  GuestNavigation,
  Navigation,
  Progress,
  PublicProfileToggle,
  UserMenu
} from './components';
import styles from './TopBar.module.scss';

export function TopBar() {
  const router = useRouter();

  const { data } = useQuery(GET_USER);
  const userInfo = useMemo(resolveQuery<UserInfo | null>(data, 'user', null), [
    data
  ]);

  const activeTeam = userInfo?.teams?.find(
    (userTeam) => userTeam.team.id === userInfo?.activeTeam
  );

  const logo = <img src="/logo.svg" className={styles.Logo} />;

  const logoMarkup = userInfo ? (
    <Link href="/dashboard">
      <a>{logo}</a>
    </Link>
  ) : (
    <a href="https://www.tests.com/">{logo}</a>
  );

  const navigationMarkup = userInfo ? (
    <Navigation
      items={[
        {
          icon: 'dashboard',
          content: 'Dashboard',
          path: '/dashboard',
          active: router.pathname === '/dashboard'
        },
        {
          icon: 'skills',
          content: 'Skills',
          path: '/skills/job',
          active:
            router.pathname.includes('skills') &&
            !router.pathname.includes('project')
        },
        {
          icon: 'team',
          content: 'Team',
          path: activeTeam ? '/team/' + activeTeam.team.alias : '/team',
          active:
            router.pathname.includes('team') &&
            !router.pathname.includes('projects')
        },
        {
          icon: 'projects',
          content: 'Projects',
          path: activeTeam
            ? `/team/${activeTeam.team.alias}/projects`
            : '/noTeam',
          active:
            router.pathname.includes('project') ||
            router.pathname.includes('projects') ||
            router.pathname.includes('noTeam')
        }
      ]}
    />
  ) : (
    <GuestNavigation
      items={[
        {
          content: 'About',
          url: 'https://tests.com/about'
        },
        {
          content: 'For teams',
          url: 'https://tests.com/for-teams'
        },
        {
          content: 'What is Tests',
          url: 'https://tests.com/what-is-tests'
        }
      ]}
    />
  );

  const controlsMarkup = userInfo && (
    <div className={styles.Controls}>
      <Progress userInfo={userInfo} />

      <PublicProfileToggle userInfo={userInfo} />

      <UserMenu userInfo={userInfo} />
    </div>
  );

  return (
    <div className={styles.TopBar}>
      {logoMarkup}
      {navigationMarkup}
      {controlsMarkup}
    </div>
  );
}
