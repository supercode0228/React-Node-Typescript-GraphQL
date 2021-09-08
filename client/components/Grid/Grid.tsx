/**
 * @format
 */

import React from 'react';
import { Spacing } from '../../types';
import { classNames, variationName } from '../../utilities/css';
import styles from './Grid.module.scss';

type Columns = 'one' | 'two' | 'three';

export interface GridProps {
  /** Content to display inside the grid */
  children?: React.ReactNode;
  /** Equal height columns */
  equalHeight?: boolean;
  /** Keep the layout and make the last column width fixed */
  keepLayout?: boolean;
  /** Columns inside the grid */
  columns?: Columns;
  /** Adjust gap between rows and columns */
  spacing?: Spacing;
}

export function Grid({
  children,
  equalHeight,
  keepLayout,
  columns,
  spacing
}: GridProps) {
  const className = classNames(
    styles.Grid,
    equalHeight && styles.equalHeight,
    keepLayout && styles.keepLayout,
    columns && styles[variationName('columns', columns)],
    spacing && styles[variationName('spacing', spacing)]
  );

  return <div className={className}>{children}</div>;
}
