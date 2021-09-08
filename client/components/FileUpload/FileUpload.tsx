/**
 * @format
 */

import React from 'react';
import { Link } from '../Link';
import styles from './FileUpload.module.scss';

export interface FileUploadProps {
  /** Content to display as the file upload trigger */
  children: React.ReactNode;
  /** Accept */
  accept?: string;
  /** Callback when input changes */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ children, accept, onChange }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const inputMarkup = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      className={styles.Input}
      onChange={onChange}
    />
  );

  return (
    <>
      {inputMarkup}

      <Link
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.click();
          }
        }}
      >
        {children}
      </Link>
    </>
  );
}
