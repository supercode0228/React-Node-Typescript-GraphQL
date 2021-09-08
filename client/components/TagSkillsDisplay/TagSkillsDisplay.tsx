/**
 * @format
 */

import React from 'react';
import skillColorMap from '../../../shared/data/skillColorMap.json';
import { ResolvedAggregatedSkill } from '../../../shared/types';
import styles from './TagSkillsDisplay.module.scss';

export interface TagSkillsDisplayProps {
  /** Skills to display */
  skills: ResolvedAggregatedSkill[];
  /** Skill type */
  skillType: string;
}

export function TagSkillsDisplay({ skills, skillType }: TagSkillsDisplayProps) {
  return (
    <div className={styles.TagSkillsDisplay}>
      {skills.map((skill, index) => (
        <div
          key={index}
          className={styles.TagContainer}
          style={{
            width: `${
              skill.skill.name.length * 8 +
              18 +
              10 * (skill && skill.strengths ? skill.strengths?.length : 0)
            }px`
          }}
        >
          {skill.strengths
            ?.sort((a, b) => b - a)
            .map((strength, index) => {
              if (index < 5)
                return (
                  <div
                    key={skill.skill.name + strength}
                    className={styles.Tag}
                    style={{
                      backgroundColor:
                        skillType === 'software'
                          ? skillColorMap[strength]
                          : '#000',
                      color:
                        skillType !== 'software' || skill.strength >= 6
                          ? '#fff'
                          : '#333',
                      left: `${index * 10}px`,
                      zIndex:
                        (skill && skill.strengths
                          ? skill.strengths?.length
                          : 0) - index,
                      width: `${skill.skill.name.length * 8 + 18}px`
                    }}
                  >
                    {index === 0 && skill.skill.name}
                  </div>
                );
            })}
        </div>
      ))}
    </div>
  );
}
