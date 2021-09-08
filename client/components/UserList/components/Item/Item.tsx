/**
 * @format
 */

import React from 'react';
import { Avatar } from '../../../Avatar';

import { classNames } from '../../../../utilities/css';
import styles from '../../UserList.module.scss';

export interface UserListItemProps {
  /** Id of the user */
  id: string;
  /** Avatar of the user */
  avatar: string;
  /** Name of the user */
  name: string;
  /** Job Title of the user */
  jobTitle: string;
  /** A destination to link to */
  url?: string;
  /** Whether or not the user is external */
  external?: boolean;
  /** Whether or not the user is active */
  active?: boolean;
  /** Whether or not the user is hidden */
  hidden?: boolean;
  /** Whether or not the user is locked and requires upgrade */
  onClick?: (id: string) => void;
}

export function Item({
  id,
  avatar,
  name,
  jobTitle,
  url,
  external,
  active,
  hidden,
  onClick
}: UserListItemProps) {
  function handleClick(id: string) {
    onClick?.(id);
  }

  const className = classNames(
    styles.Item,
    active && styles['Item-active'],
    hidden && styles['Item-hidden']
  );

  const contentMarkup = (
    <div className={styles.Content}>
      <Avatar url={avatar} border={true} />
      <div className={styles.Right}>
        {name && <div className={styles.Name}>{name}</div>}
        {jobTitle && <div className={styles.JobTitle}>{jobTitle}</div>}
      </div>
    </div>
  );

  const control = url ? (
    <a href={url} target={external ? '_blank' : '_self'} className={className}>
      {contentMarkup}
    </a>
  ) : (
    <button type="button" className={className} onClick={() => handleClick(id)}>
      {contentMarkup}
    </button>
  );

  return <li>{control}</li>;
}
