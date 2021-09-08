/**
 * @format
 */

import { useQuery } from '@apollo/react-hooks';
import React, { useMemo, useState } from 'react';
import {
  ResolvedUserSkill,
  SkillTypeInfo,
  UserInfo
} from '../../../shared/types';
import { resolveQuery } from '../../util/graphqlHelpers';
import { teamAvatarUrl } from '../../util/profile';
import { GET_USER_SKILLS } from '../../graphql/skills';
import { ActionList } from '../ActionList';
import { Avatar } from '../Avatar';
import { BubbleSkillsDisplay } from '../BubbleSkillsDisplay';
import { Card } from '../Card';
import { Disclosure } from '../Disclosure';
import { Heading } from '../Heading';
import { Icon } from '../Icon';
import { Popover } from '../Popover';
import { SectorSkillsDisplay } from '../SectorSkillsDisplay';
import { SkillOnboardingDefinition } from '../SkillOnboardingDefinition';
import { Stack } from '../Stack';
import { Subheading } from '../Subheading';
import { TextStyle } from '../TextStyle';

export interface UserSkillsDisplayProps {
  /** User */
  user: UserInfo;
  /** Skill type */
  skillType: SkillTypeInfo;
  /** Scale */
  scale?: number;
  /** Large */
  large?: boolean;
  /** Whether or not the skill type is pinned */
  pinned?: boolean;
  /** Callback when pinning skill type */
  onPin?: (skillType: string) => void;
}

export function UserSkillsDisplay({
  user,
  skillType,
  scale,
  large,
  pinned,
  onPin
}: UserSkillsDisplayProps) {
  const { data } = useQuery(GET_USER_SKILLS, {
    variables: { userId: user.id, type: skillType.value }
  });

  const userSkills = useMemo(
    resolveQuery<ResolvedUserSkill[]>(data, 'userSkills', []),
    [data]
  );

  const [popoverActive, setPopoverActive] = useState<boolean>(false);

  function togglePopover() {
    setPopoverActive((active) => !active);
  }

  const isCustomSkill = !skillType.default;

  const popoverMarkup = user.me && !pinned && skillType.default && (
    <Popover
      active={popoverActive}
      activator={<Disclosure onClick={togglePopover} />}
      onClose={togglePopover}
    >
      <ActionList
        items={[
          {
            content: 'Pin to the top',
            onClick: () => onPin?.(skillType.value!)
          }
        ]}
        onClickAnyItem={togglePopover}
      />
    </Popover>
  );

  return (
    <Card>
      <Card.Header>
        <Stack spacing="tight" alignment="center">
          {isCustomSkill && (
            <Stack spacing="extraTight" alignment="center">
              <Avatar
                url={teamAvatarUrl(skillType.team)}
                border={true}
                size="small"
              />

              <TextStyle size="small">{skillType.team?.name}</TextStyle>
            </Stack>
          )}

          <Stack.Item fill={true}>
            {pinned ? (
              <Stack vertical={true} spacing="extraTight">
                <Stack spacing="none" alignment="center">
                  <Icon source="pin" size="large" />

                  <TextStyle uppercase={true} size="extraSmall" color="blue">
                    Pinned Skills
                  </TextStyle>
                </Stack>

                <Heading>{skillType.label}</Heading>
              </Stack>
            ) : (
              <Subheading>{skillType.label}</Subheading>
            )}
          </Stack.Item>

          <Stack.Item>
            {isCustomSkill ? (
              <TextStyle subdued={true} size="small">
                Visible only to <strong>you</strong> and{' '}
                <strong>{skillType.team?.name}</strong>
              </TextStyle>
            ) : (
              popoverMarkup
            )}
          </Stack.Item>
        </Stack>
      </Card.Header>

      {userSkills.length > 0 ? (
        <>
          {skillType.visualization === 'sector' ? (
            <SectorSkillsDisplay
              skills={userSkills}
              user={user}
              scale={scale}
              large={large}
            />
          ) : (
            <BubbleSkillsDisplay
              skills={userSkills}
              scale={scale}
              large={large}
            />
          )}
        </>
      ) : (
        <SkillOnboardingDefinition
          skillType={skillType}
          skillArea={user.skillArea}
          me={user.me}
          showExamples={pinned}
        />
      )}
    </Card>
  );
}
