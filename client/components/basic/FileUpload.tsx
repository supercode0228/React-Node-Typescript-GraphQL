import React, { useEffect, useState, useRef, useMemo } from 'react';

import styles from './FileUpload.module.scss';

interface Props {
  onChange : (value : File) => void;
  label : string;
};

const FileUpload = ({ onChange, label } : Props) => {
  return (
    <>
      <div className={styles.wrapper}>
        <button className={styles.btn}>{label}</button>
        <input type="file" onChange={evt => {
          if(evt?.target.files?.[0] != null) onChange(evt.target.files[0])
        }} />
      </div>
    </>
  );
};

export default FileUpload;
