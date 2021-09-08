/**
 * @format
 */

import Link from 'next/link';
import React, { useState } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import { classNames } from '../../../../utilities/css';
import { Icon } from '../../../Icon';
import styles from './GuestNavigation.module.scss';

type Item = {
  /** Content of the navigation item */
  content: string;
  /** Url to link to */
  url: string;
};

export interface TopBarGuestNavigationProps {
  /** Navigation items */
  items: Item[];
}

export function GuestNavigation({ items }: TopBarGuestNavigationProps) {
  const [active, setActive] = useState(false);

  function toggle() {
    setActive((active) => !active);
  }

  const className = classNames(styles.GuestNavigation, active && styles.active);

  return (
    <div className={className}>
      <a className={styles.Toggle} onClick={toggle}>
        <Icon source="navigation" color="white" />
      </a>

      <RemoveScroll enabled={active} className={styles.Wrapper}>
        {items.map(renderItem)}

        <div className={styles.GetStarted}>
          <Link href="/login">
            <a className={styles.Login}>Log in</a>
          </Link>

          <Link href="/signup">
            <a className={styles.Signup}>Sign up</a>
          </Link>
        </div>
      </RemoveScroll>
    </div>
  );
}

function renderItem(item: Item, index: number) {
  const { content, url } = item;

  return (
    <a key={index} href={url} className={styles.Item}>
      {content}
    </a>
  );
}
