/**
 * @format
 */

import moment from 'moment';
import React, { useState } from 'react';
import { TeamSkillTypeInfo } from '../../../../../shared/types';
import { classNames } from '../../../../utilities/css';
import { ActionList } from '../../../ActionList';
import { Disclosure } from '../../../Disclosure';
import { Icon } from '../../../Icon';
import { Popover } from '../../../Popover';
import { Stack } from '../../../Stack';
import { TextStyle } from '../../../TextStyle';
import { Truncate } from '../../../Truncate';
import styles from '../../CustomTeamSkillTypeList.module.scss';

export interface CustomTeamSkillTypeListItemProps {
  /** Team skill type */
  teamSkillType: TeamSkillTypeInfo;
  /** Whether or not the item is selected */
  selected?: boolean;
  /** Callback when the item is selected */
  onSelect: (teamSkillType: TeamSkillTypeInfo) => void;
  /** Callback when the item is removed */
  onRemove: (teamSkillType: TeamSkillTypeInfo) => void;
}

export function Item({
  teamSkillType,
  selected,
  onSelect,
  onRemove
}: CustomTeamSkillTypeListItemProps) {
  const [popoverActive, setPopoverActive] = useState(false);

  function togglePopover() {
    setPopoverActive((active) => !active);
  }

  const className = classNames(
    styles.Item,
    selected && styles['Item-selected']
  );

  const contentMarkup = (
    <div className={styles.Content}>
      <Stack wrap={false} spacing="tight" alignment="center">
        <Stack.Item>
          <Icon
            source={
              teamSkillType.visualization === 'bubbles' ? 'bubbles' : 'scale'
            }
            size="large"
          />
        </Stack.Item>

        <Stack.Item fill={true}>
          <Stack vertical={true} spacing="extraTight">
            <Truncate>
              <strong title={teamSkillType.name}>{teamSkillType.name}</strong>
            </Truncate>

            <TextStyle subdued={true}>
              Last update {moment(teamSkillType.updatedAt).format('MM/DD/YYYY')}
            </TextStyle>
          </Stack>
        </Stack.Item>

        <Stack.Item>
          <Popover
            active={popoverActive}
            activator={<Disclosure onClick={togglePopover} />}
            onClose={togglePopover}
          >
            <ActionList
              items={[
                { content: 'Remove', onClick: () => onRemove(teamSkillType) }
              ]}
              onClickAnyItem={togglePopover}
            />
          </Popover>
        </Stack.Item>
      </Stack>
    </div>
  );

  return (
    <div className={className} onClick={() => onSelect(teamSkillType)}>
      {contentMarkup}
    </div>
  );
}
