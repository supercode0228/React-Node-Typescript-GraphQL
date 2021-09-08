/**
 * @format
 */

import Link from 'next/link';
import React from 'react';
import { TeamInfo } from '../../../shared/types';
import { classNames } from '../../utilities/css';
import { Icon } from '../Icon';
import styles from './TeamSettingsNavigation.module.scss';

export interface TeamSettingsNavigationProps {
  /** Team */
  team: TeamInfo;
  /** Active item ID */
  activeItemId?: string;
}

export function TeamSettingsNavigation({
  team,
  activeItemId
}: TeamSettingsNavigationProps) {
  const items = [
    {
      id: 'settings',
      icon: 'gear',
      content: 'Team Settings',
      path: `/team/${team.alias}/settings`
    },
    {
      id: 'skill-types',
      icon: 'puzzle',
      content: 'Manage Skills',
      path: `/team/${team.alias}/skill-types`
    }
  ];

  return (
    <div className={styles.TeamSettingsNavigation}>
      {items.map((item: any, index: number) => {
        const className = classNames(
          styles.Item,
          item.id === activeItemId && styles['Item-active']
        );

        return (
          <Link key={index} href={item.path}>
            <a className={className}>
              <div className={styles.Icon}>
                <Icon source={item.icon} />
              </div>

              <div className={styles.Content}>{item.content}</div>
            </a>
          </Link>
        );
      })}
    </div>
  );
}
