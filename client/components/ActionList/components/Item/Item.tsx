/**
 * @format
 */

import React from 'react';
import { classNames } from '../../../../utilities/css';
import styles from '../../ActionList.module.scss';

export interface ActionListItemProps {
  /** Content of the action */
  content: string | React.ReactElement;
  /** A destination to link to */
  url?: string;
  /** Whether or not the action is external */
  external?: boolean;
  /** Whether or not the action is active */
  active?: boolean;
  /** Whether or not the action is hidden */
  hidden?: boolean;
  /** Whether or not the action is locked and requires upgrade */
  locked?: boolean;
  /** Callback when the action is clicked */
  onClick?: () => void;
}

export function Item({
  content,
  url,
  external,
  active,
  hidden,
  locked,
  onClick
}: ActionListItemProps) {
  function handleClick() {
    if (locked) {
      return;
    }

    onClick?.();
  }

  const className = classNames(
    styles.Item,
    active && styles['Item-active'],
    hidden && styles['Item-hidden']
  );

  const upgradeMarkup = locked && (
    <a href="mailto:sales@tests.com" className={styles.Upgrade}>
      Upgrade
    </a>
  );

  const contentMarkup = (
    <span className={styles.Content}>
      {content}
      {upgradeMarkup}
    </span>
  );

  const control = url ? (
    <a href={url} target={external ? '_blank' : '_self'} className={className}>
      {contentMarkup}
    </a>
  ) : (
    <button type="button" className={className} onClick={handleClick}>
      {contentMarkup}
    </button>
  );

  return <li>{control}</li>;
}
