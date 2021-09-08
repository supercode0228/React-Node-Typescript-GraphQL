import React, { useState } from 'react';

import styles from '../../Slider.module.scss';

export interface TooltipRailProps {
  activeHandleID: string;
  getRailProps: (props: object) => object;
  getEventData: (e: Event) => object;
}

export function TooltipRail(props: TooltipRailProps) {
  const [value, setValue] = useState(null);
  const [percent, setPercent] = useState(null);

  const {
    activeHandleID,
    getEventData,
    getRailProps,
  } = props;

  function onMouseEnter () {
    document.addEventListener("mousemove", onMouseMove);
  };

  function onMouseLeave() {
    setValue(null);
    setPercent(null);
    document.removeEventListener("mousemove", onMouseMove);
  };

  function onMouseMove(e: Event) {
    if (activeHandleID) {
      setValue(null);
      setPercent(null);
    } else {
      setValue((getEventData(e) as any).value);
      setPercent((getEventData(e) as any).percent);
    }
  };

  return (
    <>
      {!activeHandleID && value ? (
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
        className={styles.TooltipRail}
        {...getRailProps({
          onMouseEnter: onMouseEnter,
          onMouseLeave: onMouseLeave
        })}
      />
      <div className={styles.TooltipRailCenter} />
    </>
  );
}