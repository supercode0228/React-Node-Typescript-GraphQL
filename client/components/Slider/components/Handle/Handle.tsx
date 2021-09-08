import React, { useState } from 'react';

import { SliderItem } from 'react-compound-slider';

import styles from '../../Slider.module.scss';

export interface HandleProps {
  key: string;
  handle: SliderItem;
  isActive: Boolean;
  disabled?: Boolean;
  domain: number[];
  getHandleProps: (id: string, config: object) => object;
}

export function Handle(props: HandleProps) {
  const [mouseOver, setMouseOver] = useState(false);

  const {
    domain: [min, max],
    handle: { id, value, percent },
    isActive,
    disabled,
    getHandleProps
  } = props;

  function onMouseEnter() {
    setMouseOver(true);
  };

  function onMouseLeave() {
    setMouseOver(false);
  };

  return (
    <>
      {(mouseOver || isActive) && !disabled ? (
        <div
          className={styles.HTContainer}
          style={{
            left: `${percent}%`,
          }}
        >
          <div className="tooltip">
            <span className="tooltiptext">{value}</span>
          </div>
        </div>
      ) : null}
      <div
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className={styles.Handle}
        style={{
          left: `${percent}%`,
          backgroundColor: disabled ? "#666" : "#000"
        }}
        {...getHandleProps(id, {
          onMouseEnter: onMouseEnter,
          onMouseLeave: onMouseLeave,
        })}
      />
    </>
  );
}