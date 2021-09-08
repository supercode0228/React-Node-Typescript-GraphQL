/**
 * @format
 */

import React from 'react';
import { classNames, variationName } from '../../utilities/css';
import {
  ActionListItemProps,
  ActionListSectionProps,
  Section
} from './components';
import styles from './ActionList.module.scss';

type Theme = 'plain' | 'green' | 'blue';

export interface ActionListProps {
  /** Collection of action items */
  items?: ActionListItemProps[];
  /** Collection of sectioned action items */
  sections?: ActionListSectionProps[];
  /**
   * Theme of the action list
   * @default 'plain'
   */
  theme?: Theme;
  /** Callback when any item is clicked */
  onClickAnyItem?: ActionListItemProps['onClick'];
}

export function ActionList({
  items,
  sections = [],
  theme = 'plain',
  onClickAnyItem
}: ActionListProps) {
  const className = classNames(
    styles.ActionList,
    theme && styles[variationName('theme', theme)]
  );

  let finalSections: ActionListSectionProps[] = [];

  if (items) {
    finalSections = [{ items }, ...sections];
  } else if (sections) {
    finalSections = sections;
  }

  const sectionsMarkup = finalSections.map((section, index) => {
    return section.items.length > 0 ? (
      <Section
        key={index}
        items={section.items}
        onClickAnyItem={onClickAnyItem}
      />
    ) : null;
  });

  return <div className={className}>{sectionsMarkup}</div>;
}
