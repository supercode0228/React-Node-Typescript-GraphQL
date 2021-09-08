/**
 * @format
 */

import Link from 'next/link';
import React from 'react';
import { classNames } from '../../../../utilities/css';
import styles from './Navigation.module.scss';

type Item = {
  /** Icon of the navigation item */
  icon: string;
  /** Content of the navigation item */
  content: string;
  /** Path to link to */
  path: string;
  /** Whether or not the navigation item is active */
  active?: boolean;
};

export interface TopBarNavigationProps {
  /** Navigation items */
  items: Item[];
}

export function Navigation({ items }: TopBarNavigationProps) {
  return <div className={styles.Navigation}>{items.map(renderItem)}</div>;
}

function renderItem(item: Item, index: number) {
  const { icon, content, path, active } = item;

  const className = classNames(styles.Item, active && styles['Item-active']);

  return (
    <Link key={index} href={path}>
      <a className={className}>
        <span className={styles.ItemIcon}>
          <img
            className="mobile-icon"
            src={`/icons/mobile-nav/${icon}-${
              active ? 'active' : 'inactive'
            }.svg`}
          />
        </span>
        {content}
      </a>
    </Link>
  );
}
