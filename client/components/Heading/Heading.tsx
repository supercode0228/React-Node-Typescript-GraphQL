/**
 * @format
 */

import React from 'react';
import { HeadingTagName } from '../../types';
import styles from './Heading.module.scss';

export interface HeadingProps {
  /** Content to display inside the heading */
  children?: React.ReactNode;
  /**
   * Element name to use for the heading
   * @default 'h2'
   */
  element?: HeadingTagName;
}

export function Heading({ children, element: Element = 'h2' }: HeadingProps) {
  return <Element className={styles.Heading}>{children}</Element>;
}
