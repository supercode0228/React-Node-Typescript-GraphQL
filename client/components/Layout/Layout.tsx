/**
 * @format
 */

import React from 'react';
import { Section } from './components';
import styles from './Layout.module.scss';

export interface LayoutProps {
  /** Content to display inside the layout */
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <div className={styles.Layout}>{children}</div>;
}

Layout.Section = Section;
