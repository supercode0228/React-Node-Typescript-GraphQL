/**
 * @format
 */

import React from 'react';
import { classNames } from '../../../../utilities/css';
import styles from '../../Stack.module.scss';

export interface StackItemProps {
  /** Elements to display inside item */
  children?: React.ReactNode;
  /**
   * Fill the remaining horizontal space in the stack with the item
   * @default false
   */
  fill?: boolean;
}

export function Item({ children, fill }: StackItemProps) {
  const className = classNames(styles.Item, fill && styles['Item-fill']);

  return <div className={className}>{children}</div>;
}
