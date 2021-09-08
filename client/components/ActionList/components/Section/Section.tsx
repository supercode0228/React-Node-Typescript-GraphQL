/**
 * @format
 */

import React from 'react';
import { ActionListItemProps, Item } from '../Item';
import styles from '../../ActionList.module.scss';

export interface ActionListSectionProps {
  /** Collection of action items */
  items: ActionListItemProps[];
  /** Callback when any item is clicked */
  onClickAnyItem?: ActionListItemProps['onClick'];
}

export function Section({ items, onClickAnyItem }: ActionListSectionProps) {
  function handleClick(itemOnClick: ActionListItemProps['onClick']) {
    itemOnClick?.();
    onClickAnyItem?.();
  }

  const actionsMarkup = (
    <ul className={styles.Actions}>
      {items.map((item, index) => (
        <Item
          key={index}
          content={item.content}
          url={item.url}
          external={item.external}
          active={item.active}
          hidden={item.hidden}
          locked={item.locked}
          onClick={() => handleClick(item.onClick)}
        />
      ))}
    </ul>
  );

  return <div className={styles.Section}>{actionsMarkup}</div>;
}
