import React, { useEffect, useState, useRef, useMemo } from 'react';
import classNames from 'classnames';

import styles from './DaysOfWeekSelector.module.scss';

interface Props {
  value : number[];
  onChange : (value : number[]) => void;
  isDisabled? : boolean;
};

const DaysOfWeekSelector = ({ value, onChange, isDisabled } : Props) => {
  const days = [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ];

  return (
    <div className={classNames(styles.wrapper, { [styles.disabled] : isDisabled })}>
      {days.map((d, i) =>
        <div key={i}
          className={classNames(styles.btn, { [styles.selected]: value.includes(i) })}
          onClick={evt => {
            if(isDisabled)
              return;
            const newValue = value.slice();
            if(value.includes(i))
              newValue.splice(value.findIndex(v => v === i), 1);
            else
              newValue.push(i);
            onChange(newValue);
          }}
        >
          {d}
        </div>
      )}
    </div>
  );
};

export default DaysOfWeekSelector;
