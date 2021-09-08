/**
 * @format
 */

import { useQuery } from '@apollo/react-hooks';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import {
  ResolvedUserSkill,
  TeamInfo,
  TeamSkillsInfo
} from '../../../shared/types';
import { isPro } from '../../../shared/util/plan';
import { GET_TEAM_SKILLS } from '../../graphql/skills';
import { resolveQuery } from '../../util/graphqlHelpers';
import { ActionList } from '../ActionList';
import { BubbleSkillsDisplay } from '../BubbleSkillsDisplay';
import { Disclosure } from '../Disclosure';
import { Heading } from '../Heading';
import { Icon } from '../Icon';
import { Popover } from '../Popover';
import { Stack } from '../Stack';
import { TextStyle } from '../TextStyle';
import styles from './TeamSkillsDisplay.module.scss';

export interface TeamSkillsDisplayProps {
  /** Team */
  team: TeamInfo;
  /** Skill type */
  skillType?: string;
  /** Skill area */
  skillArea?: string;
  /** Text filter */
  textFilter?: string;
  /** Weight */
  weigthBy?: string;
  /** Label */
  label?: string;
  /** Description */
  description?: string;
  /** Fullscreen */
  fullscreen?: boolean;
  /**
   * Bubble scale
   * @default 1.0
   */
  scale?: number;
  /** Callback when fullscreen is toggled */
  onFullscreenToggle?: (skillArea?: string) => void;
  /** Callback when skill is clicked */
  onSkillClick?: (skill: ResolvedUserSkill) => void;
}

export function TeamSkillsDisplay({
  team,
  skillType,
  skillArea,
  textFilter,
  weigthBy,
  label,
  description,
  fullscreen,
  scale = 1.0,
  onFullscreenToggle,
  onSkillClick
}: TeamSkillsDisplayProps) {
  const [showing, setShowing] = useState('top');
  const [showingPopoverActive, setShowingPopoverActive] = useState(false);

  const { data } = useQuery(GET_TEAM_SKILLS, {
    variables: {
      team: team.id,
      type: skillType,
      skillArea,
      textFilter,
      showing
    },
    skip: !skillType
  });

  const teamSkills = useMemo(
    resolveQuery<TeamSkillsInfo | null>(data, 'teamSkills', null),
    [data]
  );

  function toggleShowingPopover() {
    setShowingPopoverActive((active) => !active);
  }

  const skills = teamSkills?.skills.map((skill) => ({
    ...skill,
    strength: weigthBy === 'userCount' ? skill.userCount || 0 : skill.strength
  }));

  const isEmpty = teamSkills && !teamSkills.skills.length;

  const skillMemberCount = teamSkills?.userCount || 0;

  const showingOptions = [
    {
      value: 'top',
      label: 'Top 10'
    },
    {
      value: 'newest',
      label: 'Newest 10'
    },
    {
      value: 'all',
      label: 'All',
      locked: !isPro(team.plan)
    }
  ];

  const selectedShowingLabel = showingOptions.find(
    (showingOption) => showingOption.value === showing
  )?.label;

  const fullscreenToggleMarkup = onFullscreenToggle && (
    <div className={styles.Toggle}>
      <a onClick={() => onFullscreenToggle(skillArea)}>
        <Icon source={fullscreen ? 'shrink' : 'fullscreen'} />
      </a>
    </div>
  );

  return (
    <div className={styles.TeamSkillsDisplay}>
      <div className={styles.Header}>
        <Stack wrap={false}>
          <Stack.Item fill={true}>
            <Stack vertical={true} spacing="extraTight">
              <Heading>{label}</Heading>

              {!isEmpty && (
                <Stack.Item>
                  {description ? (
                    <TextStyle subdued={true}>{description}</TextStyle>
                  ) : (
                    <Link
                      href={`/team/${team.alias}/members?skillArea=${
                        skillArea || ''
                      }`}
                    >
                      <a className="link member-count">
                        {skillMemberCount} member{skillMemberCount > 1 && 's'}
                      </a>
                    </Link>
                  )}
                </Stack.Item>
              )}
            </Stack>
          </Stack.Item>

          {!isEmpty && (
            <Stack.Item>
              <Popover
                active={showingPopoverActive}
                activator={
                  <Disclosure
                    label={selectedShowingLabel}
                    theme="green"
                    onClick={toggleShowingPopover}
                  />
                }
                noBorder={true}
                onClose={toggleShowingPopover}
              >
                <ActionList
                  items={showingOptions.map((showingOption) => {
                    return {
                      content: showingOption.label,
                      active: showingOption.value === showing,
                      locked: showingOption.locked,
                      onClick: () => setShowing(showingOption.value)
                    };
                  })}
                  theme="green"
                  onClickAnyItem={toggleShowingPopover}
                />
              </Popover>
            </Stack.Item>
          )}
        </Stack>
      </div>

      <div className={styles.Content}>
        {isEmpty ? (
          <>
            <img
              className="centered"
              src="/img/profile-not-found.png"
              style={{ width: '296px', marginTop: '70px' }}
            />

            <span
              className="centered"
              style={{
                textAlign: 'center',
                marginTop: '30px',
                marginBottom: '80px'
              }}
            >
              Looks like no one in your team has listed this specific skill. Try
              searching with a different keyword
            </span>
          </>
        ) : (
          <>
            <BubbleSkillsDisplay
              skills={skills || []}
              scale={scale}
              large={true}
              onClick={onSkillClick}
            />

            {fullscreenToggleMarkup}
          </>
        )}

        {fullscreen && isEmpty && fullscreenToggleMarkup}
      </div>
    </div>
  );
}
