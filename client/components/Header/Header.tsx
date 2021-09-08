/**
 * @format
 */

import React from 'react';
import { classNames } from '../../utilities/css';
import { Section } from './components';
import styles from './Header.module.scss';

export interface HeaderProps {
  /** Content to display inside the header */
  children?: React.ReactNode;
  /** Whether or not the header is compressed */
  compressed?: boolean;
  /** Whether or not the header is slim */
  slim?: boolean;
  /**
   * Whether or not to display separator between sections
   * @default true
   */
  separator?: boolean;
}

export function Header({
  children,
  compressed,
  slim,
  separator = true
}: HeaderProps) {
  const className = classNames(
    styles.Header,
    compressed && styles.compressed,
    slim && styles.slim,
    separator && styles.separator
  );

  return (
    <div className={className}>
      <div className={styles.Container}>{children}</div>
    </div>
  );
}

Header.Section = Section;
