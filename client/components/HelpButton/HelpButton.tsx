/**
 * @format
 */

import React, { useState } from 'react';
import { ActionList } from '../ActionList';
import { ActionListItemProps } from '../ActionList/components';
import { Popover } from '../Popover';
import styles from './HelpButton.module.scss';

export interface HelpButtonProps {
  /** Custom support actions */
  customActions?: ActionListItemProps[];
}

export function HelpButton({ customActions }: HelpButtonProps) {
  const [active, setActive] = useState(false);

  function toggle() {
    setActive((active) => !active);
  }

  const activator = (
    <a onClick={toggle} className={styles.Activator}>
      <img src="/icons/help.png" />
    </a>
  );

  let actions: ActionListItemProps[] = [];

  const defaultActions: ActionListItemProps[] = [
    {
      content: 'Support',
      url: 'https://www.tests.com/support',
      external: true
    },
    {
      content: 'Write to us',
      url: 'https://www.tests.com/contact',
      external: true
    },
    {
      content: 'Bug report',
      url: 'mailto:support@tests.com?subject=Bug report'
    },
    {
      content: 'Legal summary',
      url: 'https://www.tests.com/legal/user-terms',
      external: true
    }
  ];

  if (customActions) {
    actions = [...defaultActions, ...customActions];
  } else {
    actions = defaultActions;
  }

  return (
    <div className={styles.HelpButton}>
      <Popover active={active} activator={activator} onClose={toggle}>
        <ActionList items={actions} onClickAnyItem={toggle} />
      </Popover>
    </div>
  );
}
