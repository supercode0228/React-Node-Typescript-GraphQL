/**
 * @format
 */

import { useMutation, useQuery } from '@apollo/react-hooks';
import copy from 'copy-to-clipboard';
import getConfig from 'next/config';
import React, { useMemo, useState } from 'react';
import {
  GET_USER,
  REQUEST_ACCOUNT_ACTIVATION,
  UPDATE_USER_DATA
} from '../../../../graphql/user';
import { GET_USER_SKILLS } from '../../../../graphql/skills';
import { ResolvedUserSkill, UserInfo } from '../../../../../shared/types';
import { resolveQuery } from '../../../../util/graphqlHelpers';
import { calculateProfileCompletion } from '../../../../util/profile';
import { classNames } from '../../../../utilities/css';
import Tooltip from '../../../basic/Tooltip';
import { Icon } from '../../../Icon';
import { Popover } from '../../../Popover';
import { Stack } from '../../../Stack';
import { Switch } from '../../../Switch';
import styles from './PublicProfileToggle.module.scss';

const { publicRuntimeConfig } = getConfig();

export interface TopBarPublicProfileToggleProps {
  /** Current user info */
  userInfo: UserInfo;
}

export function PublicProfileToggle({
  userInfo
}: TopBarPublicProfileToggleProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [share, setShare] = useState(false);

  const [accountActivationRequested, setAccountActivationRequested] = useState(
    false
  );

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

  const { profileCompletionPercent } = calculateProfileCompletion(
    userInfo,
    jobSkills,
    softSkills,
    softwareSkills
  );

  const [requestAccountActivation, {}] = useMutation(
    REQUEST_ACCOUNT_ACTIVATION
  );

  const [updateUserData, {}] = useMutation(UPDATE_USER_DATA);

  function togglePopover() {
    setPopoverActive((active) => !active);

    if (!popoverActive && share) {
      setShare(false);
    }
  }

  function toggleShare() {
    setShare((active) => !active);
  }

  async function handleChange(value: boolean) {
    await updateUserData({
      variables: {
        data: {
          publicProfile: value
        }
      },
      refetchQueries: [
        {
          query: GET_USER
        }
      ]
    });
  }

  async function resendAccountActivation() {
    await requestAccountActivation();

    setAccountActivationRequested(true);
  }

  const iconSource = userInfo.publicProfile
    ? 'profilePublicWhite'
    : 'profilePrivateWhite';

  const activator = (
    <a
      className={classNames(
        styles.Activator,
        popoverActive && styles['Activator-active']
      )}
      onClick={togglePopover}
    >
      <Icon source={iconSource} color="white" />
    </a>
  );

  const shareUrl = `${publicRuntimeConfig.RootUri}/user/${userInfo.alias}`;

  return (
    <div className={styles.PublicProfileToggle}>
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={togglePopover}
      >
        <div className={styles.Content}>
          <Stack vertical={true} spacing="tight">
            <Stack wrap={false} spacing="extraLoose" alignment="center">
              <Stack.Item fill={true}>
                <div className={styles.Label}>
                  {userInfo.publicProfile ? (
                    <span>
                      Make my profile private and visible only to my team
                    </span>
                  ) : (
                    <span>Make my profile public and sharable</span>
                  )}

                  {!userInfo.publicProfile && !userInfo.emailVerified && (
                    <div className={styles.Warning}>
                      <span>Verify your account to make it public.</span>

                      {!accountActivationRequested ? (
                        <a onClick={resendAccountActivation}>Resend email</a>
                      ) : (
                        <span style={{ color: '#000' }}>Sent!</span>
                      )}
                    </div>
                  )}

                  {!userInfo.publicProfile &&
                    userInfo.emailVerified &&
                    profileCompletionPercent < 1.0 && (
                      <div className={styles.Warning}>
                        <span>Complete your profile to make it public.</span>
                      </div>
                    )}
                </div>
              </Stack.Item>

              <Stack.Item>
                <Switch
                  checked={userInfo.publicProfile || false}
                  disabled={
                    !userInfo.publicProfile &&
                    (!userInfo.emailVerified || profileCompletionPercent < 1.0)
                  }
                  onChange={handleChange}
                />
              </Stack.Item>
            </Stack>

            <Stack wrap={false} alignment="center">
              <Stack.Item fill={true}>
                <Stack wrap={false} spacing="extraTight" alignment="center">
                  <Icon
                    source={
                      userInfo.publicProfile
                        ? 'profilePublicBlack'
                        : 'profilePrivateBlack'
                    }
                  />

                  {userInfo.publicProfile ? (
                    <span>Your profile is currently public</span>
                  ) : (
                    <span>Your profile is currently private</span>
                  )}
                </Stack>
              </Stack.Item>

              {userInfo.publicProfile && (
                <Stack.Item>
                  <a
                    className={classNames(
                      styles.Tag,
                      share && styles['Tag-active']
                    )}
                    onClick={toggleShare}
                  >
                    Share
                  </a>
                </Stack.Item>
              )}
            </Stack>

            {share && (
              <div className={styles.Share}>
                <div className={styles.ShareBox}>
                  <a
                    href={`https://twitter.com/share?url=${encodeURIComponent(
                      shareUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/icons/share-twitter.svg" />
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      shareUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/icons/share-facebook.svg" />
                  </a>

                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                      shareUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/icons/share-linkedin.svg" />
                  </a>

                  <Tooltip tooltip="Copied!" trigger="click">
                    <a className="link" onClick={() => copy(shareUrl)}>
                      <img src="/icons/share-copy.svg" />
                    </a>
                  </Tooltip>
                </div>
              </div>
            )}
          </Stack>
        </div>
      </Popover>
    </div>
  );
}
