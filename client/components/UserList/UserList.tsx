/**
 * @format
 */

import React from 'react';
import { UserListItemProps, Item } from './components';
import { classNames } from '../../utilities/css';
import styles from './UserList.module.scss';

export interface UserListProps {
  /** Collection of user items */
  items?: UserListItemProps[];
}

export function UserList({ items = [] }: UserListProps) {
  const className = classNames(styles.UserList);

  const itemsMarkup = items.map((item, index) => {
    return items.length > 0 ? (
      <Item
        key={index}
        id={item.id}
        avatar={item.avatar}
        name={item.name}
        jobTitle={item.jobTitle}
        onClick={item.onClick}
      />
    ) : null;
  });

  return <ul className={className}>{itemsMarkup}</ul>;
}
