/**
 * @format
 */

import React from 'react';
import { HeadingTagName } from '../../types';
import styles from './DisplayText.module.scss';

export interface DisplayTextProps {
  /** Content to display inside the display text */
  children?: React.ReactNode;
  /**
   * Element name to use for the display text
   * @default 'p'
   */
  element?: HeadingTagName;
}

export function DisplayText({
  children,
  element: Element = 'p'
}: DisplayTextProps) {
  return <Element className={styles.DisplayText}>{children}</Element>;
}
