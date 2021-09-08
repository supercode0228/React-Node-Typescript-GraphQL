/**
 * @format
 */

import React from 'react';
import styles from './Label.module.scss';

export interface LabelProps {
  /** Content to display inside the label */
  children: React.ReactNode;
  /** Unique identifier for the label */
  id?: string;
}

export function Label({ children, id }: LabelProps) {
  return (
    <div className={styles.Label}>
      <label htmlFor={id} className={styles.Text}>
        {children}
      </label>
    </div>
  );
}
