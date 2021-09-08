/**
 * @format
 */

import { useQuery } from '@apollo/react-hooks';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { ResolvedUserSkill, UserInfo } from '../../../../../shared/types';
import { GET_USER_SKILLS } from '../../../../graphql/skills';
import { resolveQuery } from '../../../../util/graphqlHelpers';
import { calculateProfileCompletion } from '../../../../util/profile';
import { classNames } from '../../../../utilities/css';
import { Popover } from '../../../Popover';
import { Stack } from '../../../Stack';
import styles from './Progress.module.scss';

export interface TopBarProgressProps {
  /** Current user info */
  userInfo: UserInfo;
}

export function Progress({ userInfo }: TopBarProgressProps) {
  const [popoverActive, setPopoverActive] = useState(false);

  function togglePopover() {
    setPopoverActive((active) => !active);
  }

  const { data: jobSkillData } = useQuery(GET_USER_SKILLS, {
    variables: { userId: userInfo?.id, type: 'job' },
    skip: !userInfo || !userInfo.me
  });

  const jobSkills = useMemo(
    resolveQuery<ResolvedUserSkill[]>(jobSkillData, 'userSkills', []),
    [jobSkillData]
  );

  const { data: softSkillData } = useQuery(GET_USER_SKILLS, {
    variables: { userId: userInfo?.id, type: 'soft' },
    skip: !userInfo || !userInfo.me
  });

  const softSkills = useMemo(
    resolveQuery<ResolvedUserSkill[]>(softSkillData, 'userSkills', []),
    [softSkillData]
  );

  const { data: softwareSkillData } = useQuery(GET_USER_SKILLS, {
    variables: { userId: userInfo?.id, type: 'software' },
    skip: !userInfo || !userInfo.me
  });

  const softwareSkills = useMemo(
    resolveQuery<ResolvedUserSkill[]>(softwareSkillData, 'userSkills', []),
    [softwareSkillData]
  );

  const {
    profileCompletionPercent,
    profileCompletionFields
  } = calculateProfileCompletion(
    userInfo,
    jobSkills,
    softSkills,
    softwareSkills
  );

  if (profileCompletionPercent >= 1.0) {
    return null;
  }

  const className = classNames(styles.Progress, popoverActive && styles.active);

  const activator = (
    <div className={className} onClick={togglePopover}>
      <Stack spacing="none" distribution="equalSpacing">
        <span>Profile completed</span>

        <span>{Math.floor(profileCompletionPercent * 100)}%</span>
      </Stack>

      <div className={styles.Bar}>
        <span style={{ width: `${profileCompletionPercent * 100}%` }}></span>
      </div>
    </div>
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopover}
    >
      <div className={styles.Content}>
        <div className={styles.Summary}>
          {profileCompletionFields.reduce((a, b) => a + b.value, 0)}/
          {profileCompletionFields.length} Steps completed
        </div>

        {profileCompletionFields
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((field, index) => (
            <div key={index} className={styles.Step}>
              <Link href={field.url}>
                <a>
                  <Stack spacing="tight" alignment="center">
                    <img
                      src={
                        field.value
                          ? '/icons/checkmark-green.svg'
                          : '/icons/checkmark-grey.svg'
                      }
                    />

                    <span>{field.label}</span>
                  </Stack>
                </a>
              </Link>
            </div>
          ))}
      </div>
    </Popover>
  );
}
