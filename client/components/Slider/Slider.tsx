/**
 * @format
 */

import React, { useEffect, useState } from 'react';

import { Slider as ReactSlider, Handles, Tracks } from 'react-compound-slider';
import { Handle, Track } from './components';

import styles from './Slider.module.scss';

const sliderStyle: React.CSSProperties = {
  position: 'relative',
  width: '80%',
  margin: '20% 10%'
};

export interface SliderProps {
  /** chart value */
  zoom?: { value: number; active: boolean };
  /** Hanlde Slider value */
  onChange: (value: number, active: boolean) => void;
}

export function Slider({ zoom, onChange }: SliderProps) {
  const [values, setValues] = useState([100]);
  const [update, setUpdate] = useState([100]);
  const [domain, setDomain] = useState([1, 300]);

  function handleUpdate(update: ReadonlyArray<number>) {
    setUpdate(update as any);
  }

  function handleChange(values: ReadonlyArray<number>) {
    setValues(values as any);
    onChange(values[0], true);
  }

  return (
    <div className={styles.SliderContainer}>
      <ReactSlider
        mode={1}
        step={1}
        domain={domain}
        rootStyle={sliderStyle}
        onUpdate={handleUpdate}
        onChange={handleChange}
        values={values}
      >
        <div className={styles.Rail} />
        <Handles>
          {({ handles, activeHandleID, getHandleProps }) => (
            <div className="slider-handles">
              {handles.map((handle) => {
                if (zoom && !zoom.active)
                  handle = {
                    ...handle,
                    value: zoom ? zoom.value : 100,
                    percent: ((zoom ? zoom.value : 100) / 300) * 100
                  };
                return (
                  <Handle
                    key={handle.id}
                    handle={handle}
                    domain={domain}
                    isActive={handle.id === activeHandleID}
                    getHandleProps={getHandleProps}
                  />
                );
              })}
            </div>
          )}
        </Handles>
        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
              {tracks.map(({ id, source, target }) => (
                <Track
                  key={id}
                  disabled={false}
                  source={source}
                  target={target}
                  getTrackProps={getTrackProps}
                />
              ))}
            </div>
          )}
        </Tracks>
      </ReactSlider>
    </div>
  );
}
