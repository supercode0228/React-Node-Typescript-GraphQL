/**
 * @format
 */

import React from 'react';

import { Stack } from '../Stack';
import { TextStyle } from '../TextStyle';

import { classNames, variationName } from '../../utilities/css';

import styles from './Radio.module.scss';

type Alignment = 'leading' | 'trailing' | 'center' | 'fill' | 'baseline';
type Size = 'extraSmall' | 'small' | 'medium' | 'large';

export interface RadioProps {
  /** Radio Selected or Unselected */
  active: boolean;
  /**
   * Alignment of the Radio
   * @default 'center'
   */
  alignment?: Alignment;
  /** Circle or Rect */
  circle?: boolean;
  /** Button key */
  name: string;
  /**
   * Size of the Radio
   * @default 'medium'
   */
  size?: Size;
  /** Radio Button title */
  title: string;
  /** Vertical */
  vertical?: boolean;
  /** Handle Button Click */
  onClick: (value: string) => void;
}

export function Radio({
  active = false,
  alignment = 'center',
  circle = true,
  name,
  size = 'medium',
  title,
  vertical = false,
  onClick
}: RadioProps) {
  const RadioClassName = classNames(
    styles.Radio,
    circle && styles.RadioCircle,
    size && styles[variationName('sizeRadio', size)]
  );
  const RadioActiveClassName = classNames(
    styles.RadioActive,
    circle && styles.RadioCircle,
    size && styles[variationName('sizeRadioActive', size)]
  );

  return (
    <div onClick={() => onClick(name)}>
      <Stack vertical={vertical} alignment={alignment} spacing="tight">
        <div className={RadioClassName}>
          {active && <div className={RadioActiveClassName} />}
        </div>
        <TextStyle size={size} uppercase={true}>
          {title}
        </TextStyle>
      </Stack>
    </div>
  );
}
