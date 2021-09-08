import _ from 'lodash';
// import Picker from 'react-month-picker';
import { useRef } from 'react';

import Picker from './custom-react-month-picker.jsx';

interface Props {
  value : number;
  onChange : (value : number) => void;
  allowPerpetual? : boolean;
  perpetualLabel? : string;
}
interface ConvertedValue {
  year : number;
  month : number;
  perpetual? : boolean;
}

export const PERPETUAL_TIME = 2000000000000;
export const BUFFER_TIME = 86400000 * 15 + 1;

const MonthPicker = ({ value, onChange, allowPerpetual, perpetualLabel } : Props) => {
  const pickerRef = useRef<any>(null);

  let pickerLang = {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      , from: 'From', to: 'To'
  };
  const convertedValue = value < PERPETUAL_TIME
    ? { year: new Date(value).getFullYear(), month: new Date(value).getMonth() + 1, perpetual: false }
    : { year: new Date().getFullYear(), month: new Date().getMonth(), perpetual: true };

  let makeText = (m : ConvertedValue) => {
    if(m.perpetual)
      return 'CURRENT';
    if (m && m.year && m.month)
      return (pickerLang.months[m.month-1] + '. ' + m.year)
    return '?';
  };

  return (
    <Picker
      ref={pickerRef}
      years={_.range(1900, new Date().getFullYear() + 1)}
      value={convertedValue}
      lang={pickerLang.months}
      onChange={(year : number, month : number, idx : number, perpetual : boolean = false, dismiss : boolean = true) => {
        // if(dismiss)
          pickerRef.current?.dismiss();
        onChange(perpetual ? PERPETUAL_TIME : (new Date(year, month).getTime() - BUFFER_TIME));
      }}
      allowPerpetual={allowPerpetual}
      perpetualLabel={perpetualLabel}
      >
        <div className="selected-date" onClick={evt => pickerRef.current.show()}>{makeText(convertedValue)}</div>
    </Picker>
  );
};

export default MonthPicker;
