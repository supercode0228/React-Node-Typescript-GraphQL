/**
 * @format
 */

import React from 'react';
import { classNames, variationName } from '../../utilities/css';
import { Icon } from '../Icon';
import styles from './Tag.module.scss';

type Size = 'small' | 'large';

type Color = 'black' | 'gray' | 'blue' | 'yellow';

type Shape = 'square' | 'rounded';

export interface TagProps {
  /** Content to display inside the tag */
  children: React.ReactNode;
  /**
   * Size of the tag
   * @default 'large'
   */
  size?: Size;
  /**
   * Color of the tag
   * @default 'black'
   */
  color?: Color;
  /**
   * Shape of the tag
   * @default 'rounded'
   */
  shape?: Shape;
  /** Subdued */
  subdued?: boolean;
  /** Callback when the tag is clicked */
  onClick?: () => void;
  /** Callback when the tag is removed */
  onRemove?: () => void;
}

export function Tag({
  children,
  size = 'large',
  color = 'black',
  shape = 'rounded',
  subdued,
  onClick,
  onRemove
}: TagProps) {
  const className = classNames(
    styles.Tag,
    subdued && styles.subdued,
    onClick && styles.clickable,
    size && styles[variationName('size', size)],
    color && styles[variationName('color', color)],
    shape && styles[variationName('shape', shape)]
  );

  const removeMarkup = onRemove && (
    <a onClick={onRemove}>
      <Icon source={color === 'blue' ? 'closeTagBlue' : 'closeTagWhite'} />
    </a>
  );

  return (
    <div className={className} onClick={onClick}>
      {children}
      {removeMarkup}
    </div>
  );
}
