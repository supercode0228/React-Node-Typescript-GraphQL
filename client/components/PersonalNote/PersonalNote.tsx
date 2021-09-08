/**
 * @format
 */

import { useMutation } from '@apollo/react-hooks';
import moment from 'moment';
import React, { useState } from 'react';
import { PersonalNoteInfo } from '../../../shared/types';
import { REMOVE_PERSONAL_NOTE } from '../../../client/graphql/user';
import { ActionList } from '../ActionList';
import { Disclosure } from '../Disclosure';
import { Popover } from '../Popover';
import { Stack } from '../Stack';
import { TextStyle } from '../TextStyle';
import styles from './PersonalNote.module.scss';

export interface PersonalNoteProps {
  /** Personal note */
  personalNote: PersonalNoteInfo;
  /** Callback when the personal note is removed */
  onRemove?: () => void;
}

export function PersonalNote({ personalNote, onRemove }: PersonalNoteProps) {
  const [popoverActive, setPopoverActive] = useState<boolean>(false);

  const [removePersonalNote] = useMutation(REMOVE_PERSONAL_NOTE);

  function togglePopover() {
    setPopoverActive((active) => !active);
  }

  async function remove() {
    await removePersonalNote({ variables: { id: personalNote.id } });

    onRemove?.();
  }

  return (
    <div className={styles.PersonalNote}>
      <Stack wrap={false} alignment="center">
        <Stack.Item fill={true}>
          <Stack vertical={true} spacing="extraTight">
            <TextStyle subdued={true}>
              {moment(personalNote.createdTime).format('MM/DD/YYYY')}
            </TextStyle>

            <TextStyle>{personalNote.msg}</TextStyle>
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
                {
                  content: 'Remove',
                  onClick: remove
                }
              ]}
              onClickAnyItem={togglePopover}
            />
          </Popover>
        </Stack.Item>
      </Stack>
    </div>
  );
}
