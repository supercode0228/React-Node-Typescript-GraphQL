import React, { useEffect, useState, useRef, useMemo } from 'react';

import styles from './Checkbox.module.scss';

interface Props {
  checked : boolean;
  onChange : (value : boolean) => void;
  label : string;
};

const Checkbox = ({ checked, onChange, label } : Props) => {
  return (
    <>
      <label className={styles.container}>
        {/* One */}
        <label className={styles.label}>{label}</label>
        <input type="checkbox" checked={checked} onChange={evt => onChange(evt.target.checked)} />
        <span className={styles.checkmark}></span>
      </label>
    </>
  );
};

export default Checkbox;
