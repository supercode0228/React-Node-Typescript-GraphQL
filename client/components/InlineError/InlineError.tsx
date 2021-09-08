/**
 * @format
 */

import React from 'react';
import styles from './InlineError.module.scss';

export interface InlineErrorProps {
  /** Content to display inside the inline error */
  children?: React.ReactNode;
}

export function InlineError({ children }: InlineErrorProps) {
  return <div className={styles.InlineError}>{children}</div>;
}
