import React, { useState } from 'react';

interface Props {
  value : string;
  onChange : (value : string) => void;
  placeholder? : string;
  required? : boolean;
};

const PasswordInput = ({ required, value, onChange, placeholder } : Props) => {
  const [ shown, setShown ] = useState(false);

  return (
    <>
      <div className="input-subgroup">
        <input
          type="password"
          onChange={evt => onChange(evt.target.value)}
          value={value || ''}
          placeholder={placeholder}
          required={required}
          style={{ display: shown ? 'none' : '' }}
        />
        <input
          type="text"
          value={value || ''}
          onChange={evt => {}}
          placeholder={placeholder}
          style={{ display: shown ? '' : 'none' }}
        />

        <div className="icon-group"
          onPointerDown={evt => setShown(true)}
          onPointerUp={evt => setShown(false)}
        >
          <div
            className="icon large"
            style={{
              visibility: shown ? 'hidden' : 'visible',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 15C23 15 21.8289 16.3078 20 17.4279M14.9432 19V21M14.9432 19C16.0041 19 17.0736 18.7694 18 18.4189M14.9432 19C13.8388 19 12.8434 18.7501 11.8864 18.3751M7 15C7 15 8.02632 16.1462 9.65788 17.2114M18 18.4189L18.5 20M18 18.4189C18.7257 18.1443 19.3984 17.7963 20 17.4279M11.8864 18.3751L11 20M11.8864 18.3751C11.0643 18.0531 10.3124 17.6388 9.65788 17.2114M9.65788 17.2114L8.5 18.5M20 17.4279L21 18.5" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div
            className="icon large"
            style={{
              visibility: shown ? 'visible' : 'hidden',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.96846 15.2582C7.86549 15.1628 7.77486 15.076 7.69734 15C7.77486 14.924 7.86549 14.8372 7.96846 14.7418C8.36001 14.3791 8.92722 13.895 9.62732 13.4114C11.037 12.4376 12.9364 11.5 15 11.5C17.0636 11.5 18.963 12.4376 20.3727 13.4114C21.0728 13.895 21.64 14.3791 22.0315 14.7418C22.1345 14.8372 22.2251 14.924 22.3027 15C22.2251 15.076 22.1345 15.1628 22.0315 15.2582C21.64 15.6209 21.0728 16.105 20.3727 16.5886C18.963 17.5624 17.0636 18.5 15 18.5C12.9364 18.5 11.037 17.5624 9.62732 16.5886C8.92722 16.105 8.36001 15.6209 7.96846 15.2582Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="15" cy="15" r="2" fill="black"/>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordInput;
