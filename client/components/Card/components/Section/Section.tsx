/**
 * @format
 */

import React from 'react';
import styles from '../../Card.module.scss';

export interface CardSectionProps {
  /** Content to display inside the section */
  children?: React.ReactNode;
}

export function Section({ children }: CardSectionProps) {
  return <div className={styles.Section}>{children}</div>;
}
