import React, { useRef } from 'react';

interface Props {
  value : string;
  onChange : (value : string) => void;
  placeholder? : string;
  required? : boolean;
  maxLength? : number;
  rows? : number;
  style? : any;
};

const LimitedTextArea = ({ required, value, onChange, placeholder, maxLength, rows, style } : Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <>
      <div className="input-subgroup">
        {maxLength &&
          <div className="length-limit-indicator">{maxLength - value.length}</div>
        }
        <textarea
          ref={textareaRef}
          value={value}
          rows={rows}
          maxLength={maxLength}
          onChange={evt => onChange(evt.target.value)}
          placeholder={placeholder}
          required={required}
          style={style}
        />
      </div>
    </>
  );
};

export default LimitedTextArea;
