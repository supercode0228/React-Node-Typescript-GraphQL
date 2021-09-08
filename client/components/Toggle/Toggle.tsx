/**
 * @format
 */

import React from 'react';
import { classNames, variationName } from '../../utilities/css';
import { Item, ToggleItemProps } from './components';
import styles from './Toggle.module.scss';

type Size = 'small' | 'large';

export interface ToggleProps {
  /** Collection of toggle items */
  items: ToggleItemProps[];
  /**
   * Size of the toggle
   * @default 'large'
   * */
  size?: Size;
}

export function Toggle({ items, size = 'large' }: ToggleProps) {
  const className = classNames(
    styles.Toggle,
    size && styles[variationName('size', size)]
  );

  const itemsMarkup = items.map((item, index) => {
    return (
      <Item
        key={index}
        content={item.content}
        icon={item.icon}
        selected={item.selected}
        onClick={item.onClick}
      />
    );
  });

  return <div className={className}>{itemsMarkup}</div>;
}
