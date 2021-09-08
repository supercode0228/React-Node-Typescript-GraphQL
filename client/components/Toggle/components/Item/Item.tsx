/**
 * @format
 */

import React from 'react';
import { classNames } from '../../../../utilities/css';
import { BundledIcon, Icon } from '../../../Icon';
import styles from '../../Toggle.module.scss';

export interface ToggleItemProps {
  /** Content of the item */
  content?: string;
  /** Icon */
  icon?: BundledIcon;
  /** Whether or not the item is selected */
  selected?: boolean;
  /** Callback when the item is clicked */
  onClick: () => void;
}

export function Item({ content, icon, selected, onClick }: ToggleItemProps) {
  const className = classNames(
    styles.Item,
    selected && styles['Item-selected']
  );

  const contentMarkup = icon ? <Icon source={icon} size="large" /> : content;

  return (
    <button type="button" className={className} onClick={onClick}>
      {contentMarkup}
    </button>
  );
}
