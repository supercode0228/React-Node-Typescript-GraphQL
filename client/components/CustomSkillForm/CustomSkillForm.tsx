/**
 * @format
 */

import React, { useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import skillTypes from '../../../shared/data/skillTypes.json';
import { Skill, SkillTypeInfo } from '../../../shared/types';
import { ADD_CUSTOM_SKILL, FIND_SKILLS } from '../../graphql/skills';
import { resolveQuery } from '../../util/graphqlHelpers';

export interface CustomSkillFormProps {
  /** Skill type */
  skillType: SkillTypeInfo;
  /** Query */
  query: string;
  /** Exclude */
  exclude?: string[];
  /** Callback when done */
  onDone: (skill: Skill | null) => void;
}

export function CustomSkillForm({
  skillType,
  query,
  exclude,
  onDone
}: CustomSkillFormProps) {
  const { data } = useQuery(FIND_SKILLS, {
    variables: {
      name: query,
      exclude,
      limit: 1,
      exact: true,
      onlyTypes: skillTypes.map((st) => st.value)
    },
    skip: query === ''
  });

  const skills = useMemo(resolveQuery<Skill[]>(data, 'skills', []), [data]);

  const [addCustomSkill] = useMutation(ADD_CUSTOM_SKILL);

  async function addSkill() {
    const result = await addCustomSkill({
      variables: {
        data: { name: query, type: skillType.value }
      }
    });

    const skill = result.data.addCustomSkill;
    onDone(skill);
  }

  return (
    <div className="add-custom-skill">
      <h2>🤔 Confirm</h2>

      {skills.length > 0 ? (
        <>
          <div className="confirm-note">
            Looks like <strong>‘{query}’</strong> already exists in
            <br />
            <strong>
              {skillTypes.find((st) => st.value === skills[0].type)?.label}
            </strong>
            , are you sure you want to
            <br />
            add it to <strong>{skillType.label}</strong> as well?
          </div>

          <div className="btn-container">
            <button className="btn" onClick={() => onDone(null)}>
              No
            </button>

            <button className="btn-muted" onClick={() => addSkill()}>
              Yes
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="confirm-note">
            Are you sure you want to add this skill to your profile?
          </div>

          <div className="btn-container">
            <button className="btn" onClick={() => addSkill()}>
              Confirm
            </button>
          </div>
        </>
      )}
    </div>
  );
}
