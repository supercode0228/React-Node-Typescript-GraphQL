import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import { Collapse } from 'react-collapse';
import Select from 'react-select';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

import { resolveQuery } from '../util/graphqlHelpers';
import { GET_USER_AVAILABILITY, GET_USER_AVAILABILITY_SUMMARY, UPDATE_USER_AVAILABILITY, UPDATE_USER_DATA, GET_USER } from '../graphql/user';
import { UserAvailabilityInfo, UserAvailabilitySummaryInfo, UserInfo } from '../../shared/types';
import DateRangePicker from '../components/basic/DateRangePicker';
import UserAvailabilityMonthSummary from './UserAvailabilityMonthSummary';
import DaysOfWeekSelector from './basic/DaysOfWeekSelector';

const UserAvailabilityEditor = () => {
  const [editing, setEditing] = useState(false);
  const [initialAvailability, setInitialAvailability] = useState<UserAvailabilityInfo[] | null>(null);

  const { data } = useQuery(GET_USER_AVAILABILITY, {
    // variables: {  },
  });
  const userAvailability = useMemo(resolveQuery<UserAvailabilityInfo[] | null>(data, 'userAvailability', null), [data]);
  const [updateUserAvailability, { loading: updateUserAvailabilityLoading }] = useMutation(UPDATE_USER_AVAILABILITY);

  const [ availability, setAvailability ] = useState<UserAvailabilityInfo[] | null>(null);
  const [ editedAvailabilityType, setEditedAvailabilityType ] = useState('');

  const [ summaryYear, setSummaryYear ] = useState(new Date().getFullYear());
  const { data: summaryData } = useQuery(GET_USER_AVAILABILITY_SUMMARY, {
    variables: { year: summaryYear },
  });
  const userAvailabilitySummary = useMemo(resolveQuery<UserAvailabilitySummaryInfo | null>(summaryData, 'userAvailabilitySummary', null), [summaryData]);

  const { data: userData } = useQuery(GET_USER);
  const userInfo = useMemo(resolveQuery<UserInfo | null>(userData, 'user', null), [userData]);
  const [ updateUserData, { } ] = useMutation(UPDATE_USER_DATA);

  const updateProjectUtilizationViewMonths = async (months : number) => {
    await updateUserData({
      variables: { data: { projectUtilizationViewMonths: months } },
      refetchQueries: [
        {
          query: GET_USER,
        },
        {
          query: GET_USER_AVAILABILITY_SUMMARY,
          variables: { year: summaryYear },
        },
      ],
    });
  };

  useEffect(
    () => {
      if(!userAvailability)
        return;
      const availability = userAvailability.map(a => ({ ...a, saved: true }));
      setAvailability(availability);
      setInitialAvailability(availability);

    },
    [userAvailability]
  );

  const [ currentMonthAvailability, setCurrentMonthAvailability ] = useState<number>(1.0);
  useEffect(
    () => {
      if(!userAvailabilitySummary)
        return;
      setCurrentMonthAvailability(userAvailabilitySummary.monthSummaries[new Date().getMonth()]);
    },
    [userAvailabilitySummary]
  );

  const saveData = async () => {
    await updateUserAvailability({
      variables: {
        availability: availability?.filter(a => a.startTime && a.endTime)
          .map(a => ({ ...a, __typename: undefined, saved: undefined })),
      },
      refetchQueries: [
        {
          query: GET_USER_AVAILABILITY,
          variables: {  },
        },
        {
          query: GET_USER_AVAILABILITY_SUMMARY,
          variables: { year: summaryYear },
        },
      ],
      awaitRefetchQueries: true
    })
  };

  const removeAvailability = (idx : number) => {
    if(!availability)
      return;
    const newAvailability = availability.slice();
    newAvailability.splice(idx, 1);
    setAvailability(newAvailability);
  };

  const availabilityTypes = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'planned', label: 'Planned leave' },
  ];

  const percentAwayOptions = _.range(10, 101, 10).map(p => ({ value: p / 100.0, label: `${p}%` })).reverse();

  return (
    <div className="user-availability-editor">
      <img className="close" src="/icons/cross-big.svg" onClick={evt => setEditing(false)} style={{ display: editing ? undefined : 'none' }} />
      <div className="editor-title">Wow {userInfo?.name}!</div>
      <div className="current-availability-note">
        {currentMonthAvailability > 0
          ? <>Looks like you’re available in <strong style={{ backgroundColor: '#B7FEE4' }}>{moment().format('MMMM')}</strong></>
          : <>Looks like you’re completely occupied in <strong style={{ backgroundColor: '#B7FEE4' }}>{moment().format('MMMM')}</strong></>
        }
      </div>
      <button
        className="btn-slim dark edit-btn"
        style={{ display: editing ? 'none' : undefined }}
        onClick={evt => setEditing(true)}
      >
        <strong>Set availability</strong>
      </button>
      <div className="cols" style={{ display: editing ? undefined : 'none' }}>
        <div className="summary-wrapper">
          <div className="summary-navigation">
            <a className="link" onClick={evt => setSummaryYear(summaryYear-1)}>
              <img src="/icons/arrow-medium-left.svg" />
            </a>
            <div className="year">{summaryYear}</div>
            <a className="link" onClick={evt => setSummaryYear(summaryYear+1)}>
              <img src="/icons/arrow-medium-right.svg" />
            </a>
          </div>
          <UserAvailabilityMonthSummary userAvailabilitySummary={userAvailabilitySummary} year={summaryYear} />
        </div>
        <div className="editor">

          <div
            className={classNames(
              "availability-type"
            )}
          >
            <div
              className="head"
            >
              <div className="icon"
                style={{
                  background: `url(/icons/project-utilization.png)`,
                  backgroundSize: 'contain',
                }}
              />
              <div className="type">
                <div className="compound-type">
                  <div className="name">Project utilization</div>
                  <div className="comment">Next {userInfo?.projectUtilizationViewMonths} months</div>
                </div>

                <div className="options">
                  <Dropdown>
                    <DropdownTrigger>
                      <img src="/icons/arrow-small-down.svg" />
                    </DropdownTrigger>
                    <DropdownContent>
                      <ul>
                        {_.range(3, 13, 3).map((m, i) =>
                          <li key={i}>
                            <a
                              className={classNames("link", { active : m === userInfo?.projectUtilizationViewMonths })}
                              onClick={evt => updateProjectUtilizationViewMonths(m)}
                            >
                              Next {m} months
                            </a>
                          </li>
                        )}
                      </ul>
                    </DropdownContent>
                  </Dropdown>
                </div>
              </div>

              <div className="stats">{Math.round((userAvailabilitySummary?.projectUtilization || 0) * 100)}%</div>
            </div>
          </div>

          {availabilityTypes.map((availabilityType, ati) =>
            <div key={ati}
              className={classNames(
                "availability-type",
                { active: editedAvailabilityType === availabilityType.value }
              )}
            >
              <div
                className="head selectable"
                onClick={evt =>
                  setEditedAvailabilityType(editedAvailabilityType === availabilityType.value ? '' : availabilityType.value)
                }
              >
                <div className="icon"
                  style={{
                    background: `url(/icons/${availabilityType.value}.png)`,
                    backgroundSize: 'contain',
                  }}
                />
                <div className="type">{availabilityType.label}</div>

                {availabilityType.value === 'vacation' &&
                  <div className="stats">{userAvailabilitySummary?.vacationDaysSet} days set</div>
                }
                {availabilityType.value === 'planned' &&
                  <div className="stats">
                    {availability?.find(a => a.type === 'planned') ? 'Set' : 'Not set'}
                  </div>
                }
              </div>
              <Collapse isOpened={editedAvailabilityType === availabilityType.value}>
                <div className="body">
                  {availability?.map((a, i) => {
                    if(a.type !== availabilityType.value)
                      return null;
                    return (
                      <div key={i} className={classNames("availability-record", { saved: a.saved })}>
                        <div className="marker" />
                        <div className="rows">
                          <div className="row">
                            {a.saved ?
                              <>
                                <div className="saved-date">
                                  {moment(a.startTime).format('MM/DD/YYYY')}
                                </div>
                                <div className="saved-date">
                                  {moment(a.endTime).format('MM/DD/YYYY')}
                                </div>
                              </>
                            :
                            <>
                              <div className="label">From</div>
                              <div className="label" style={{ left: '131px' }}>To</div>
                              <DateRangePicker
                                startTime={a.startTime}
                                endTime={a.endTime}
                                onChange={({ startTime, endTime }) => {
                                  const newAvailability = availability.slice();
                                  newAvailability[i] = {
                                    ...newAvailability[i],
                                    startTime,
                                    endTime,
                                  };
                                  setAvailability(newAvailability);
                                }}
                              />
                            </>
                            }
                          </div>

                          {availabilityType.value === 'planned' &&
                            <div className="row">
                              <div className="label">Set recurrence</div>
                              <div className="days-of-week">
                                <DaysOfWeekSelector
                                  value={a.daysOfWeek || []}
                                  onChange={daysOfWeek => {
                                    const newAvailability = availability.slice();
                                    newAvailability[i] = {
                                      ...newAvailability[i],
                                      daysOfWeek,
                                    };
                                    setAvailability(newAvailability);
                                  }}
                                  isDisabled={a.saved}
                                />
                              </div>
                              <div className="label" style={{ left: '180px' }}>Away</div>
                              <Select
                                value={percentAwayOptions.find(p => p.value === a.percentAway)}
                                onChange={option => {
                                  const newAvailability = availability.slice();
                                  newAvailability[i] = {
                                    ...newAvailability[i],
                                    percentAway: (option as any)?.value || 1.0,
                                  };
                                  setAvailability(newAvailability);
                                }}
                                options={percentAwayOptions}
                                isDisabled={a.saved}
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    width: '83px',
                                    height: '37px',
                                    minHeight: '37px',
                                    background: state.isDisabled ? 'transparent' : '#fff',
                                    border: state.isDisabled ? '1px solid transparent' : '1px solid #dbdbdb',
                                    // borderLeft: '0',
                                    borderRadius: '2px',
                                    borderTopLeftRadius: '0',
                                    borderTopRightRadius: '0',
                                  }),
                                  singleValue: (provided) => ({
                                    ...provided,
                                    fontSize: '10px',
                                    color: '#666',
                                  }),
                                  indicatorSeparator: (provided) => ({
                                    ...provided,
                                    display: 'none',
                                  }),
                                  indicatorsContainer: (provided, state) => ({
                                    ...provided,
                                    visibility: state.isDisabled ? 'hidden' : 'visible',
                                  }),
                                  option: (provided) => ({
                                    ...provided,
                                    fontSize: '10px',
                                    color: '#666',
                                  }),
                                }}
                              />
                            </div>
                          }
                        </div>
                        <a className="link" onClick={evt => removeAvailability(i)}>
                          <img className="remove-availability" src="/icons/trash.svg" title="Remove" />
                        </a>
                      </div>
                    );
                  })}
                  <a
                    className="link add-record"
                    onClick={evt => {
                      const newAvailability = availability?.slice() || [];
                      newAvailability.push({ percentAway: 1.0, type: availabilityType.value });
                      setAvailability(newAvailability);
                    }}
                  >
                    + ADD NEW
                  </a>
                </div>
              </Collapse>
            </div>
          )}
        </div>
      </div>
      <button
        disabled={updateUserAvailabilityLoading}
        className="btn-slim dark save-btn"
        style={{ display: editing ? undefined : 'none' }}
        onClick={() => availability === initialAvailability ? setEditing(false) : saveData()}
      >
        {availability === initialAvailability ? 'Done' : 'Save'}
      </button>
    </div>
  );
};

export default UserAvailabilityEditor;
