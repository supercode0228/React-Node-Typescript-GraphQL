/**
 * @format
 */

import React from 'react';
import { Spacing } from '../../../../types';
import { classNames, variationName } from '../../../../utilities/css';
import styles from '../../Header.module.scss';

export interface HeaderSectionProps {
  /** Content to display inside the section */
  children?: React.ReactNode;
  /** Fill the remaining horizontal space in the header with the section */
  fill?: boolean;
  /** Adjust section horizontal spacing */
  spacing?: Spacing;
  /** Whether or not the section contains an action */
  action?: boolean;
}

export function Section({
  children,
  fill,
  spacing,
  action
}: HeaderSectionProps) {
  const className = classNames(
    styles.Section,
    fill && styles['Section-fill'],
    action && styles['Section-action'],
    spacing && styles[variationName('Section-spacing', spacing)]
  );

  return <div className={className}>{children}</div>;
}
