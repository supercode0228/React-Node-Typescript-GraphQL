/**
 * @format
 */

import React, { useState } from 'react';
import { UserJobExperienceInfo, UserTeamInfo } from '../../../shared/types';
import { teamAvatarUrl } from '../../util/profile';
import MonthPicker from '../basic/MonthPicker';
import { ActionList } from '../ActionList';
import { Avatar } from '../Avatar';
import { Disclosure } from '../Disclosure';
import { Input } from '../Input';
import { Popover } from '../Popover';
import { Stack } from '../Stack';
import { Subheading } from '../Subheading';
import { Truncate } from '../Truncate';
import styles from './JobExperience.module.scss';

export interface JobExperienceProps {
  /** Job experience */
  jobExperience: UserJobExperienceInfo;
  /** User teams */
  userTeams?: UserTeamInfo[];
  /** Callback when the job experience is changed */
  onChange: (jobExperience: UserJobExperienceInfo) => void;
  /** Callback when the job experience is removed */
  onRemove: () => void;
}

export function JobExperience({
  jobExperience,
  userTeams,
  onChange,
  onRemove
}: JobExperienceProps) {
  const [popoverActive, setPopoverActive] = useState<boolean>(false);

  function togglePopover() {
    setPopoverActive((active) => !active);
  }

  const userTeam = userTeams?.find(
    (userTeam) => userTeam.team.id === jobExperience.team
  );

  return (
    <div className={styles.JobExperience}>
      <div className={styles.Workspace}>
        <Stack wrap={false} spacing="tight" alignment="center">
          <Stack.Item>
            <Avatar url={teamAvatarUrl(userTeam?.team)} border={true} />
          </Stack.Item>

          <Stack.Item fill={true}>
            {userTeam ? (
              <Subheading>
                <Truncate>{userTeam?.team.name}</Truncate>
              </Subheading>
            ) : (
              <Input
                placeholder="Name"
                value={jobExperience.customName}
                size="subheading"
                onChange={(customName) =>
                  onChange({ ...jobExperience, customName })
                }
              />
            )}
          </Stack.Item>

          <Stack.Item>
            <Popover
              active={popoverActive}
              activator={<Disclosure onClick={togglePopover} />}
              onClose={togglePopover}
            >
              <ActionList
                items={[
                  {
                    content: 'Remove',
                    onClick: onRemove
                  }
                ]}
                onClickAnyItem={togglePopover}
              />
            </Popover>
          </Stack.Item>
        </Stack>
      </div>

      <div className={styles.Period}>
        <div className={styles.Time}>
          <MonthPicker
            value={jobExperience.startTime || Date.now()}
            onChange={(startTime) =>
              onChange({
                ...jobExperience,
                startTime: Math.min(startTime, Date.now())
              })
            }
          />
        </div>

        <div className={styles.Time}>
          <MonthPicker
            value={jobExperience.endTime || Date.now()}
            onChange={(endTime) => onChange({ ...jobExperience, endTime })}
            allowPerpetual={true}
            perpetualLabel="I am currently working in this role"
          />
        </div>
      </div>
    </div>
  );
}
