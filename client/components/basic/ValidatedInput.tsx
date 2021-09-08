import { withFormsy } from 'formsy-react';
import { PassDownProps } from 'formsy-react/dist/withFormsy';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import classNames from 'classnames';
import PasswordInput from './PasswordInput';

interface Props extends PassDownProps<string> {
  type : string;
  placeholder? : string;
  required? : boolean;
  manualError? : boolean;
};

const ValidatedInput = ({ type, required, value, setValue, placeholder, errorMessage, validationError, showError, manualError, isPristine, isFormSubmitted, isValid } : Props) => {
  return (
    <>
      {type === 'password' ?
        <PasswordInput
          onChange={val => setValue(val)}
          value={value || ''}
          placeholder={placeholder}
          required={required}
        />
      :
        <input
          type={type}
          onChange={evt => setValue(evt.target.value)}
          className={classNames({ invalid: (isFormSubmitted && showError) && !isValid || manualError })}
          value={value || ''}
          placeholder={placeholder}
          required={required}
        />
      }
      <span
        style={{ display: ((isFormSubmitted && showError) || manualError) ? '' : 'none' }}
        className="validation-error"
      >
        {(manualError ? validationError : errorMessage)}
      </span>
    </>
  );
};

export default withFormsy(ValidatedInput);
