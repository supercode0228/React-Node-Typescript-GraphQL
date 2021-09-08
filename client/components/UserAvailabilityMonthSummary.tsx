import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import moment from 'moment';

import { resolveQuery } from '../util/graphqlHelpers';
import { GET_USER_AVAILABILITY, GET_USER_AVAILABILITY_SUMMARY, UPDATE_USER_AVAILABILITY } from '../graphql/user';
import { UserAvailabilityInfo, UserAvailabilitySummaryInfo } from '../../shared/types';

interface Props {
  userAvailabilitySummary : UserAvailabilitySummaryInfo | null;
  year : number;
};

const UserAvailabilityMonthSummary = ({ userAvailabilitySummary, year } : Props) => {
  const cols = 3;
  const r = 23;
  const padding = 2;

  return (
    <div className="user-availability-summary">
      <svg 
        width={cols * (r+padding) * 2} 
        height={(userAvailabilitySummary?.monthSummaries.length || 0) / cols * (r+padding) * 2}
      >
        {userAvailabilitySummary?.monthSummaries.map((m, i) => {
          const angleLength = Math.min(1.0 - m, 1.0 - 1e-4) * Math.PI * 2;
          const angleStart = -Math.PI / 2;
          const arcPath = `A ${r} ${r} 0 ${angleLength > Math.PI ? 1 : 0} 1 ${r * Math.cos(angleStart+angleLength)} ${r * Math.sin(angleStart+angleLength)}`;
          const smallArcPath = `A ${r-3} ${r-3} 0 ${angleLength > Math.PI ? 1 : 0} 1 ${(r-3) * Math.cos(angleStart+angleLength)} ${(r-3) * Math.sin(angleStart+angleLength)}`;
          return (
            <g key={i} 
              style={{ 
                transform: `translate(${i%3 * (r*2 + padding*2) + r + padding}px, ${Math.floor(i/3) * (r*2 + padding*2) + r + padding}px)`
              }}
            >
              <foreignObject x={-(r+padding)} y={-(r+padding)} 
                style={{
                  width: `${(r+padding)*2-1}px`, 
                  height: `${(r+padding)*2-1}px`, 
                }}
              >
                <div style={{
                  width: `${(r+padding)*2-1}px`, 
                  height: `${(r+padding)*2-1}px`, 
                  background: '#F8F8F8', 
                  borderRadius: '2px',
                }} />
              </foreignObject>
              {(year === new Date().getFullYear() && i === new Date().getMonth())
                ? <>
                    <circle r={r} style={{ fill: '#181818' }} />
                    <circle r={r-3} style={{ fill: '#B7FEE4' }} />
                    <path 
                      fill="#FFCFCF"
                      d={`M0 0 ${(r-3) * Math.cos(angleStart)} ${(r-3) * Math.sin(angleStart)}${smallArcPath}`} 
                    />
                  </>
                : <>
                    <circle r={r} style={{ fill: '#B7FEE4' }} />
                    <path 
                      fill="#FFCFCF"
                      d={`M0 0 ${r * Math.cos(angleStart)} ${r * Math.sin(angleStart)}${arcPath}`} 
                    />
                  </>
              }
              <text style={{ fill: m < 1.0 ? '#000' : '#375E50' }}>
                <tspan 
                  x={0} 
                  y={6}
                >
                  {moment(new Date(0, i)).format('MMM').slice(0, 1)}
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default UserAvailabilityMonthSummary;
