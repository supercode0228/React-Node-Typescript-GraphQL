/**
 * @format
 */

import { useQuery } from '@apollo/react-hooks';
import React, { useMemo, useRef, useState } from 'react';
import Modal from 'react-modal';
import { Skill, SkillTypeInfo } from '../../../shared/types';
import { FIND_SKILLS } from '../../graphql/skills';
import { resolveQuery } from '../../util/graphqlHelpers';
import { CustomSkillForm } from '../CustomSkillForm';
import { Stack } from '../Stack';
import { Tag } from '../Tag';
import { TextStyle } from '../TextStyle';
import styles from './SkillSearch.module.scss';

export interface SkillSearchProps {
  /** Skill type */
  skillType: SkillTypeInfo;
  /** Initial query */
  initialQuery?: string;
  /** Exclude */
  exclude?: string[];
  /** Limit */
  limit?: number;
  /** Show empty */
  showEmpty?: boolean;
  /** Callback when a skill is selected */
  onSelect: (skill: Skill) => void;
}

export function SkillSearch({
  skillType,
  initialQuery,
  exclude,
  limit,
  showEmpty,
  onSelect
}: SkillSearchProps) {
  const elementRef = useRef<HTMLInputElement>(null);

  const SUGGESTIONS: any = {
    job: ['Animation', 'Value Chain Engineering', 'Procurement'],
    soft: ['Pattern recognition', 'Design Sense', 'Being Objective']
  };

  const [query, setQuery] = useState(initialQuery || '');

  const { data, loading } = useQuery(FIND_SKILLS, {
    variables: { type: skillType.value, name: query, exclude, limit },
    skip: showEmpty ? false : query === ''
  });

  const skills = useMemo(resolveQuery<Skill[]>(data, 'skills', []), [data]);

  const [modalOpen, setModalOpen] = useState(false);

  const isSoftwareType = skillType.value === 'software';

  const customSkillTypeAllowed = ['job', 'soft'].includes(
    skillType.value as string
  );

  function focus() {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key !== 'Enter' || query == '') {
      return;
    }

    addCustomSkill();
  }

  function addCustomSkill() {
    if (skills.length) {
      selectSkill(0);
    } else {
      setModalOpen(true);
    }
  }

  function selectSkill(index: number) {
    onSelect(skills[index]);
    setQuery('');
  }

  const offerAddCustomSkill = query !== '' && skills.length < 1 && !loading;

  return (
    <div className={styles.SkillSearch}>
      <div className={styles.Section}>
        <div className={styles.Input} onClick={focus}>
          <div className={styles.Prefix}>
            <img src="/icons/search.svg" />
          </div>

          <input
            ref={elementRef}
            type="text"
            value={query}
            placeholder="Search to add"
            autoFocus={true}
            className={styles.Element}
            onChange={(evt) => setQuery(evt.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className={styles.Suffix}>
            {offerAddCustomSkill && (
              <a onClick={addCustomSkill}>
                <img src="/icons/input-return.svg" />
              </a>
            )}

            {!offerAddCustomSkill && query !== '' && (
              <a onClick={() => setQuery('')}>
                <img src="/icons/cross-big.svg" />
              </a>
            )}
          </div>
        </div>

        {offerAddCustomSkill && (
          <div className={styles.Hint}>
            <TextStyle size="small">
              Press <strong>enter</strong> to create a new skill
            </TextStyle>
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div className={styles.Section}>
          <Stack
            spacing="tight"
            distribution={isSoftwareType ? 'center' : 'leading'}
          >
            {skills.map((skill, index) => {
              if (isSoftwareType) {
                return (
                  <div
                    className={styles.Software}
                    onClick={() => selectSkill(index)}
                  >
                    <div className={styles.SoftwareIconContainer}>
                      <div
                        className={styles.SoftwareIcon}
                        style={{
                          backgroundImage: `url(data:image/png;base64,${skill.icon})`,
                          backgroundSize: 'cover'
                        }}
                      />
                    </div>
                    <div className={styles.SoftwareSkillName}>{skill.name}</div>
                  </div>
                );
              } else {
                return (
                  <Tag
                    key={index}
                    subdued={true}
                    onClick={() => selectSkill(index)}
                  >
                    {skill.name}
                  </Tag>
                );
              }
            })}
          </Stack>
        </div>
      )}

      {query === '' && ['job', 'soft'].includes(skillType.value as string) && (
        <div className={styles.Section}>
          <div className="interaction-hint">
            E.g.{' '}
            <strong>{SUGGESTIONS[skillType.value as string].join(', ')}</strong>
          </div>
        </div>
      )}

      <div className={styles.Section}>
        <img
          className={styles.Placeholder}
          src="/img/find-skills-placeholder.png"
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            position: 'relative',
            border: '0',
            borderRadius: '10px',
            display: 'table'
          },
          overlay: {
            background: 'rgba(0, 0, 0, 0.7)'
          }
        }}
        contentLabel="Add custom skill"
        ariaHideApp={false}
      >
        <img
          className="close"
          src="/icons/cross-big.svg"
          onClick={() => setModalOpen(false)}
        />

        {customSkillTypeAllowed ? (
          <CustomSkillForm
            skillType={skillType}
            query={
              query.length > 0
                ? query.charAt(0).toUpperCase() + query.slice(1)
                : query
            }
            exclude={exclude}
            onDone={(skill) => {
              if (skill) {
                onSelect(skill);
              }

              setModalOpen(false);
              setQuery('');
            }}
          />
        ) : (
          <>
            {skillType.default ? (
              <div className="add-custom-skill">
                <h2>Contact us</h2>

                <div className="confirm-note">
                  Can’t find your {skillType.label?.toLowerCase()} in our
                  database?
                  <br />
                  Write to us at{' '}
                  <a href="mailto:wow@tests.com">wow@tests.com</a>
                  <br />
                  and we’ll add it right away.
                </div>

                <div className="btn-container">
                  <button className="btn" onClick={() => setModalOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="add-custom-skill">
                <h2>🤔 Oops!</h2>

                <div className="confirm-note">
                  Looks like you’re trying to add a skill to
                  <br />
                  your ´<strong>{skillType.label}</strong>´. Please contact
                  <br />
                  the <strong>Admin</strong> in your team to add the skill
                  <br />
                  to your team’s skill database.
                </div>

                <div className="btn-container">
                  <button className="btn" onClick={() => setModalOpen(false)}>
                    Ok
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
