/**
 * @format
 */

import React from 'react';
import { classNames, variationName } from '../../utilities/css';
import styles from './Avatar.module.scss';

type Size = 'extraSmall' | 'small' | 'medium' | 'large';

export interface AvatarProps {
  /** Url of the avatar image */
  url: string;
  /** Whether or not the avatar is bordered */
  border?: boolean;
  /**
   * Size of the avatar
   * @default 'medium'
   * */
  size?: Size;
  /** Child avatar showing in the lower right corner */
  child?: string;
  /** Display a role badge on the bottom of the avatar */
  role?: string;
  /** Display a loading spinner around the avatar */
  loading?: boolean;
}

export function Avatar({
  url,
  border,
  size = 'medium',
  child,
  role,
  loading
}: AvatarProps) {
  const className = classNames(
    styles.Avatar,
    border && styles.bordered,
    loading && styles.loading,
    size && styles[variationName('size', size)]
  );

  const childMarkup = child && (
    <div
      className={styles.Child}
      style={{
        backgroundImage: `url(${child})`
      }}
    ></div>
  );

  const roleMarkup = role && <div className={styles.Role}>{role}</div>;

  const spinnerMarkup = loading && <div className={styles.Spinner} />;

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${url})`
      }}
    >
      {childMarkup}
      {roleMarkup}
      {spinnerMarkup}
    </div>
  );
}
