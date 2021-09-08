/**
 * @format
 */

import React from 'react';
import { Skill, SkillTypeInfo } from '../../../shared/types';
import { Stack } from '../Stack';
import { Tag } from '../Tag';
import styles from './SkillOnboardingDefinition.module.scss';

export interface SkillOboardingDefinitionProps {
  /** Skill type */
  skillType: SkillTypeInfo;
  /** Skill area */
  skillArea?: string;
  /** Display information to the current user */
  me?: boolean;
  /** Show examples */
  showExamples?: boolean;
}

export function SkillOnboardingDefinition({
  skillType,
  skillArea,
  me,
  showExamples
}: SkillOboardingDefinitionProps) {
  return (
    <div className={styles.SkillOnboardingDefinition}>
      <Stack vertical={true} alignment="center">
        {skillType.default && (
          <img src={`/img/skill-intro/definition-${skillType.value}.svg`} />
        )}

        {skillType.default ? (
          <div
            className={styles.Text}
            dangerouslySetInnerHTML={{
              __html: me
                ? skillType.definition || ''
                : skillType.emptyDefinition || ''
            }}
          />
        ) : (
          <div className={styles.Text}>
            {me ? (
              <>
                <strong>{skillType.team?.name}</strong> created a custom skill
                specific to your team. Go ahead and define your{' '}
                <strong>{skillType.label}</strong>.
              </>
            ) : (
              <>{skillType.label} hasn’t been set yet.</>
            )}
          </div>
        )}

        {me && (
          <a href={`/skills/${skillType.value}?edit`}>
            <button className="btn">Add {skillType.label}</button>
          </a>
        )}

        {me && showExamples && (
          <>
            <div className="examples-separator">
              <div />
              <span>Examples</span>
              <div />
            </div>

            <Stack spacing="tight" distribution="center">
              {(skillType.examples as {
                [type: string]: Skill[];
              })[skillType.value === 'job' ? skillArea || '' : 'other']?.map(
                (skill, index) => (
                  <Tag key={index} subdued={true}>
                    {skill.name}
                  </Tag>
                )
              )}
            </Stack>
          </>
        )}
      </Stack>
    </div>
  );
}
