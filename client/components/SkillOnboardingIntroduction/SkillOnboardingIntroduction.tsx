/**
 * @format
 */

import React from 'react';
import { SkillTypeInfo } from '../../../shared/types';
import { teamAvatarUrl } from '../../util/profile';
import { Avatar } from '../Avatar';
import { DisplayText } from '../DisplayText';
import { Stack } from '../Stack';
import { TextStyle } from '../TextStyle';
import styles from './SkillOnboardingIntroduction.module.scss';

export interface SkillOnboardingIntroductionProps {
  /** Skill type */
  skillType: SkillTypeInfo;
  /** Skill area */
  skillArea?: string;
  /** Callback when the introduction is dismissed */
  onDismiss: () => void;
}

export function SkillOnboardingIntroduction({
  skillType,
  skillArea,
  onDismiss
}: SkillOnboardingIntroductionProps) {
  return (
    <div className={styles.SkillOnboardingIntroduction}>
      <Stack vertical={true} alignment="center">
        {skillType.default ? (
          <div className={styles.Emotion}>{skillType.emotion}</div>
        ) : (
          <Stack spacing="extraTight" alignment="center">
            <Avatar
              url={teamAvatarUrl(skillType.team)}
              border={true}
              size="small"
            />

            <TextStyle size="small">{skillType.team?.name}</TextStyle>
          </Stack>
        )}

        <DisplayText>{skillType.label}</DisplayText>

        {skillType.default ? (
          <div
            className={styles.Text}
            dangerouslySetInnerHTML={{
              __html: skillType.introduction || ''
            }}
          />
        ) : (
          <div className={styles.Text}>
            <strong>{skillType.team?.name}</strong> created a custom skill
            specific to your team. Go ahead and define your{' '}
            <strong>{skillType.label}</strong>.
          </div>
        )}

        <button className="btn" onClick={onDismiss}>
          Add {skillType.label}
        </button>

        {skillType.default ? (
          <img
            className={styles.Image}
            src={`/img/skill-intro/${skillType.value}${
              skillType.value === 'job' ? `-${skillArea}` : ''
            }.png`}
            style={{
              width: skillType.value === 'software' ? '338px' : undefined
            }}
          />
        ) : (
          <img
            className={styles.CustomImage}
            src={'/img/skill-intro/custom.png'}
          />
        )}
      </Stack>
    </div>
  );
}
