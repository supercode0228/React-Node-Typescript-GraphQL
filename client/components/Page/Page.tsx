/**
 * @format
 */

import React from 'react';
import styles from './Page.module.scss';

export interface PageProps {
  /** Content to display inside the page */
  children?: React.ReactNode;
}

export function Page({ children }: PageProps) {
  return <div className={styles.Page}>{children}</div>;
}
