/**
 * @format
 */

import React from 'react';
import styles from '../../Card.module.scss';

export interface CardHeaderProps {
  /** Content to display inside the header */
  children?: React.ReactNode;
}

export function Header({ children }: CardHeaderProps) {
  return <div className={styles.Header}>{children}</div>;
}
