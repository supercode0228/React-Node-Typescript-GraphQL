/**
 * @format
 */

import React from 'react';
import { classNames } from '../../../../utilities/css';
import styles from '../../Tabs.module.scss';

export interface TabItemProps {
  /** Content of the action */
  content: string;
  /** Display a badge in the top right corner */
  badge?: React.ReactNode;
  /** A destination to link to */
  url?: string;
  /** Whether or not the action is active */
  active?: boolean;
  /** Callback when the action is clicked */
  onClick?: () => void;
}

export function Item({ content, badge, url, active, onClick }: TabItemProps) {
  const className = classNames(styles.Item, active && styles['Item-active']);

  const badgeMarkup = badge && <div className={styles.Badge}>{badge}</div>;

  const contentMarkup = (
    <span className={styles.Content}>
      {content}
      {badgeMarkup}
    </span>
  );

  const control = url ? (
    <a href={url} className={className}>
      {contentMarkup}
    </a>
  ) : (
    <button type="button" className={className} onClick={onClick}>
      {contentMarkup}
    </button>
  );

  return control;
}
