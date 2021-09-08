/**
 * @format
 */

import React, { forwardRef } from 'react';
import { classNames, variationName } from '../../utilities/css';
import styles from './Disclosure.module.scss';

type Size = 'extraSmall' | 'small' | 'medium' | 'large';

type Theme = 'plain' | 'green';

export interface DisclosureProps {
  /** Label to display inside the disclosure */
  label?: React.ReactNode;
  /**
   * Font size of the disclosure
   * @default 'extraSmall'
   * */
  size?: Size;
  /**
   * Theme of the disclosure
   * @default 'plain'
   * */
  theme?: Theme;
  /** Callback when the disclosure is clicked */
  onClick: () => void;
}

export const Disclosure = forwardRef<HTMLAnchorElement, DisclosureProps>(
  function Disclosure(
    { label, size = 'extraSmall', theme = 'plain', onClick }: DisclosureProps,
    ref
  ) {
    function handleClick(event: React.MouseEvent) {
      event.stopPropagation();

      onClick();
    }

    const className = classNames(
      styles.Disclosure,
      label && styles.withLabel,
      size && styles[variationName('size', size)],
      theme && styles[variationName('theme', theme)]
    );

    return (
      <a ref={ref} className={className} onClick={handleClick}>
        {label}

        <img src="/icons/arrow-small-down.svg" />
      </a>
    );
  }
);
