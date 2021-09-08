import React, { useEffect, useState, useRef, useMemo } from 'react';
import moment, { Moment } from 'moment';
import 'react-dates/initialize';
import { DateRangePicker as AirBnBDateRangePicker } from 'react-dates';
import { MobileOnly, DesktopOnly } from '../../util/responsive';

interface DateRange {
  startTime? : number;
  endTime? : number;
};

interface Props extends DateRange {
  onChange : ({ startTime, endTime } : DateRange) => void;
  startDatePlaceholderText? : string;
  endDatePlaceholderText? : string;
  borderColor? : string;
  displayFormat? : string;
  customArrowIcon? : JSX.Element;
};

const DateRangePicker = ({
  startTime, endTime, onChange, startDatePlaceholderText, endDatePlaceholderText, borderColor = '#E0E0E0', displayFormat = 'MM/DD/YYYY',
  customArrowIcon = (<><div style={{ width: '1px', height: '35px', background: borderColor }} /></>)
} : Props) => {
  const HORIZONTAL_ORIENTATION = "horizontal";
  const VERTICAL_ORIENTATION = "vertical";

  const [ focusedInput, setFocusedInput ] = useState<"startDate" | "endDate" | null>(null);

  return (
    <>
      <MobileOnly>
        <AirBnBDateRangePicker
          startDate={startTime ? moment(startTime) : null} // momentPropTypes.momentObj or null,
          startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
          startDatePlaceholderText={startDatePlaceholderText || "MM/DD/YYYY"}
          endDate={endTime ? moment(endTime) : null} // momentPropTypes.momentObj or null,
          endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
          endDatePlaceholderText={endDatePlaceholderText || "MM/DD/YYYY"}
          onDatesChange={({ startDate, endDate }) => onChange({
            startTime: startDate?.valueOf(),
            endTime: endDate?.valueOf(),
          })}
          focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
          onFocusChange={focusedInput => setFocusedInput(focusedInput)} // PropTypes.func.isRequired,
          customArrowIcon={customArrowIcon}
          numberOfMonths={1}
          orientation={HORIZONTAL_ORIENTATION}
          displayFormat={displayFormat}
        />
      </MobileOnly>
      <DesktopOnly>
        <AirBnBDateRangePicker
          startDate={startTime ? moment(startTime) : null} // momentPropTypes.momentObj or null,
          startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
          startDatePlaceholderText={startDatePlaceholderText || "MM/DD/YYYY"}
          endDate={endTime ? moment(endTime) : null} // momentPropTypes.momentObj or null,
          endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
          endDatePlaceholderText={endDatePlaceholderText || "MM/DD/YYYY"}
          onDatesChange={({ startDate, endDate }) => onChange({
            startTime: startDate?.valueOf(),
            endTime: endDate?.valueOf(),
          })}
          focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
          onFocusChange={focusedInput => setFocusedInput(focusedInput)} // PropTypes.func.isRequired,
          customArrowIcon={customArrowIcon}
          numberOfMonths={2}
          orientation={HORIZONTAL_ORIENTATION}
          displayFormat={displayFormat}
        />
      </DesktopOnly>
    </>
  );
};

export default DateRangePicker;
