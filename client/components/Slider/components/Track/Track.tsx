import React from 'react';
import { SliderItem } from 'react-compound-slider';

import styles from '../../Slider.module.scss';

interface TrackProps {
  source: SliderItem;
  target: SliderItem;
  disabled: Boolean;
  getTrackProps: () => object;
}

export function Track({
  source,
  target,
  getTrackProps,
  disabled = false
}: TrackProps) {
  return (
    <div
      className={styles.Track}
      style={{
        backgroundColor: disabled ? "#999" : "#3e1db3",
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`
      }}
      {...getTrackProps()}
    />
  );
}