/**
 * @format
 */

import React from 'react';
import { HeadingTagName } from '../../types';
import styles from './Subheading.module.scss';

export interface SubheadingProps {
  /** Content to display inside the subheading */
  children?: React.ReactNode;
  /**
   * Element name to use for the subheading
   * @default 'h3'
   */
  element?: HeadingTagName;
}

export function Subheading({
  children,
  element: Element = 'h3'
}: SubheadingProps) {
  return <Element className={styles.Subheading}>{children}</Element>;
}
