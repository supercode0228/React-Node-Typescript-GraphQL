/**
 * @format
 */

import React from 'react';
import styles from './Image.module.scss';

export interface ImageProps {
  /** Source */
  source?: string;
}

export function Image({ source }: ImageProps) {
  return <img src={source} className={styles.Image} />;
}
