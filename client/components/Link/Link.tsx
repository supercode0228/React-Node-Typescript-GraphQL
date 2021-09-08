/**
 * @format
 */

import React from 'react';
import { classNames, variationName } from '../../utilities/css';
import styles from './Link.module.scss';

type Color = 'blue' | 'black';

export interface LinkProps {
  /** Content to display inside the link */
  children?: React.ReactNode;
  /** Destructive style */
  destructive?: boolean;
  /** Badge style */
  badge?: boolean;
  /** A destination to link to */
  url?: string;
  /** Whether or not the action is external */
  external?: boolean;
  /** Color of the text */
  color?: Color;
  /** Callback when the link is clicked */
  onClick?: () => void;
}

export function Link({
  children,
  destructive,
  badge,
  url,
  external,
  color,
  onClick
}: LinkProps) {
  const className = classNames(
    styles.Link,
    destructive && styles.destructive,
    badge && styles.badge,
    color && styles[variationName('color', color)]
  );

  return url ? (
    <a href={url} target={external ? '_blank' : '_self'} className={className}>
      {children}
    </a>
  ) : (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}
