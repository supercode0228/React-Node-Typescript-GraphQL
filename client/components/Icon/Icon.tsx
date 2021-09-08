/**
 * @format
 */

import React from 'react';
import { classNames, variationName } from '../../utilities/css';
import {
  bubbles,
  chevronDownSmall,
  chevronDownSmallBlue,
  chevronDown,
  close,
  closeTagBlue,
  closeTagWhite,
  detailBlack,
  detailGrey,
  enter,
  fullscreen,
  gear,
  grid,
  heartsGray,
  heartsRed,
  hirency,
  list,
  locked,
  navigation,
  overviewBlack,
  overviewGrey,
  peopleBlue,
  peopleGray,
  pin,
  profilePrivate,
  profilePrivateBlack,
  profilePrivateWhite,
  profilePublicBlack,
  profilePublicWhite,
  puzzle,
  scale,
  shrink
} from './icons';
import styles from './Icon.module.scss';

const BUNDLED_ICONS = {
  bubbles,
  chevronDownSmall,
  chevronDownSmallBlue,
  chevronDown,
  close,
  closeTagBlue,
  closeTagWhite,
  detailBlack,
  detailGrey,
  enter,
  fullscreen,
  gear,
  grid,
  heartsGray,
  heartsRed,
  hirency,
  list,
  locked,
  navigation,
  overviewBlack,
  overviewGrey,
  peopleBlue,
  peopleGray,
  pin,
  profilePrivate,
  profilePrivateBlack,
  profilePrivateWhite,
  profilePublicBlack,
  profilePublicWhite,
  puzzle,
  scale,
  shrink
};

export type BundledIcon = keyof typeof BUNDLED_ICONS;

type Size = 'small' | 'medium' | 'large';

type Color = 'white' | 'black';

export interface IconProps {
  /** Name of the icon */
  source: BundledIcon;
  /**
   * Size of the icon
   * @default 'medium'
   */
  size?: Size;
  /** Color of the icon */
  color?: Color;
}

export function Icon({ source, size = 'medium', color }: IconProps) {
  const iconSource = BUNDLED_ICONS[source];

  const className = classNames(
    styles.Icon,
    size && styles[variationName('size', size)],
    color && styles[variationName('color', color)]
  );

  return (
    <svg
      viewBox={iconSource.attributes.viewBox}
      dangerouslySetInnerHTML={{ __html: iconSource.content }}
      width={0}
      height={0}
      className={className}
    />
  );
}
