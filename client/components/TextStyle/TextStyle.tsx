/**
 * @format
 */

import React from 'react';
import { classNames, variationName } from '../../utilities/css';
import styles from './TextStyle.module.scss';

type Size = 'extraSmall' | 'small' | 'medium' | 'large';

type Color = 'black' | 'blue';

export interface TextStyleProps {
  /** Content to display inside the text style */
  children?: React.ReactNode;
  /** Whether or not the text style is uppercase */
  uppercase?: boolean;
  /** Whether or not the text style is subdued */
  subdued?: boolean;
  /**
   * Size of the text
   * @default 'medium'
   */
  size?: Size;
  /** Color of the text */
  color?: Color;
}

export function TextStyle({
  children,
  uppercase,
  subdued,
  size = 'medium',
  color
}: TextStyleProps) {
  const className = classNames(
    styles.TextStyle,
    uppercase && styles.uppercase,
    subdued && styles.subdued,
    size && styles[variationName('size', size)],
    color && styles[variationName('color', color)]
  );

  return <span className={className}>{children}</span>;
}
