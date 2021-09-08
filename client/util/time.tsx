import React from 'react';
import { FormattedRelativeTime } from 'react-intl';
import moment from 'moment';
import { contractTime } from '../../shared/util/time';

export const relativeTiming = (startTime? : number, endTime? : number, precise? : boolean) => {
  return (
    <>
      {(startTime && (startTime > Date.now())) &&
        <>
          Starts&nbsp;
          <strong>
            {precise
              ? moment(startTime).format('MMM D')
              : <FormattedRelativeTime {...contractTime(startTime - Date.now())} />
            }
          </strong>
        </>
      }
      {(startTime && endTime 
        && (startTime <= Date.now() && endTime > Date.now())) &&
        <>
          Ends&nbsp;
          <strong>
            {precise
              ? moment(endTime).format('MMM D')
              : <FormattedRelativeTime {...contractTime(endTime - Date.now())} />
            }
          </strong>
        </>
      }
      {(endTime && (endTime <= Date.now())) &&
        <>
          Closed&nbsp;
          <strong>
            {precise
              ? moment(endTime).format('MMM D')
              : <FormattedRelativeTime {...contractTime(endTime - Date.now())} />
            }
          </strong>
        </>
      }
      {(!startTime && !startTime) && 
        <>Date not set</>
      }
    </>
  );
};
