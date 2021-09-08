import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import classNames from 'classnames';
import moment from 'moment';

import styles from './AvailabilityTimeline.module.scss';
import { ResolvedUserSkill, TeamSkillsInfo, ProjectMemberInfo, UserAvailabilityInfo } from '../../shared/types';
import { resolveQuery } from '../util/graphqlHelpers';
import { SUGGEST_PROJECT_MEMBERS } from '../graphql/project';

interface Props {
  availability : UserAvailabilityInfo[];
  startTime : number;
  endTime : number;
  period? : [ number, number ];
  showAvailability? : boolean;
  startLabel? : string;
  wide? : boolean;
  low? : boolean;
};

const AvailabilityTimeline = ({ availability, startTime, endTime, period, showAvailability = true, startLabel = '', wide, low } : Props) => {
  const relativeTime = (time? : number) => {
    return Math.min(Math.max(((time || startTime) - startTime) / (endTime - startTime) * 100, 0), 100);
  };
  const relativeTimeInterval = (start? : number, end? : number) => {
    return Math.min(Math.max(((end || 0) - (start || 0)) / (endTime - startTime) * 100, 0), 100 - relativeTime(start));
  };
  return (
    <div className={classNames(styles.availabilityTimeline, { [styles.wide]: wide }, { [styles.low]: low })}>
      <div className={styles.inner}>
        <div className={styles.availabilityContainer}>
          {showAvailability &&
          <>
            <div className={styles.available} />
            {availability.map((a, i) =>
              <div
                key={i}
                className={styles.unavailable}
                style={{
                  left: `${relativeTime(a.startTime)}%`,
                  width: `${relativeTimeInterval(a.startTime, a.endTime)}%`,
                }}
              />
            )}
          </>
          }
        </div>

        <div className={styles.axis} />
        <div className={styles.startMarker} />
        <div className={styles.endMarker} />

        {period &&
          <div
            className={styles.period}
            style={{
              left: `${relativeTime(period[0])}%`,
              width: `${relativeTimeInterval(...period)}%`,
            }}
          >
            <div className={classNames(styles.handle, styles.left)}>
              <div className={styles.bar} />
              <div className={styles.bar} />
            </div>
            <div className={classNames(styles.handle, styles.right)}>
              <div className={styles.bar} />
              <div className={styles.bar} />
            </div>
            
            {/* <div className={styles.startLine} />
            <div className={styles.startMarker} />
            <div className={classNames(styles.date)}>
              <div>{moment(period[0]).format('MMM D')}</div>
            </div> */}
          </div>
        }
        
        {!period &&
          <div className={styles.startLine} />
        }
        <div className={classNames(styles.date, styles.start)}>
          <div>{moment(startTime).format('MMM YYYY')}</div>
          <div className={styles.today}>
            {startLabel.length > 0 ? startLabel : <>&nbsp;</>}
          </div>
        </div>
        <div className={classNames(styles.date, styles.end)}>
          <div>{moment(endTime).format('MMM YYYY')}</div>
          <div className={styles.today}>
            &nbsp;
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityTimeline;
