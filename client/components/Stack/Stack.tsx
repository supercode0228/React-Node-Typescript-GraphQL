/**
 * @format
 */

import React from 'react';
import { Spacing } from '../../types';
import { elementChildren, wrapWithComponent } from '../../utilities/components';
import { classNames, variationName } from '../../utilities/css';
import { Item } from './components';
import styles from './Stack.module.scss';

type Alignment = 'leading' | 'trailing' | 'center' | 'fill' | 'baseline';

type Distribution =
  | 'equalSpacing'
  | 'leading'
  | 'trailing'
  | 'center'
  | 'fill'
  | 'fillEvenly';

export interface StackProps {
  /** Elements to display inside the stack */
  children?: React.ReactNode;
  /** Wrap stack elements to additional rows as needed on small screens (Defaults to true) */
  wrap?: boolean;
  /** Stack the elements vertically */
  vertical?: boolean;
  /** Adjust spacing between elements */
  spacing?: Spacing;
  /** Adjust vertical alignment of elements */
  alignment?: Alignment;
  /** Adjust horizontal alignment of elements */
  distribution?: Distribution;
}

export function Stack({
  children,
  wrap,
  vertical,
  spacing,
  alignment,
  distribution
}: StackProps) {
  const className = classNames(
    styles.Stack,
    wrap === false && styles.noWrap,
    vertical && styles.vertical,
    spacing && styles[variationName('spacing', spacing)],
    alignment && styles[variationName('alignment', alignment)],
    distribution && styles[variationName('distribution', distribution)]
  );

  const itemMarkup = elementChildren(children).map((child, index) => {
    const props = { key: index };
    return wrapWithComponent(child, Item, props);
  });

  return <div className={className}>{itemMarkup}</div>;
}

Stack.Item = Item;
