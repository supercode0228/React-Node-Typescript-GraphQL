/**
 * @format
 */

import React from 'react';
import { classNames } from '../../../../utilities/css';
import styles from '../../Layout.module.scss';

export interface LayoutSectionProps {
  /** Content to display inside the section */
  children?: React.ReactNode;
  /** Secondary */
  secondary?: boolean;
}

export function Section({ children, secondary }: LayoutSectionProps) {
  const className = classNames(
    styles.Section,
    secondary && styles['Section-secondary']
  );

  return <div className={className}>{children}</div>;
}
