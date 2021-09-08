/**
 * @format
 */

import React from 'react';
import { default as ReactSwitch } from 'react-switch';
import { classNames } from '../../utilities/css';
import styles from './Switch.module.scss';

export interface SwitchProps {
  /** Whether or not the switch is checked */
  checked: boolean;
  /** Whether or not the switch is disabled */
  disabled?: boolean;
  /** Callback when the switch is changed */
  onChange: (value: boolean) => void;
}

export function Switch({ checked, disabled, onChange }: SwitchProps) {
  const className = classNames(styles.Switch, checked && styles.checked);

  return (
    <ReactSwitch
      checked={checked}
      onChange={onChange}
      width={40}
      height={20}
      handleDiameter={14}
      checkedIcon={false}
      uncheckedIcon={false}
      offColor="#F2F2F2"
      offHandleColor="#AFAFAF"
      onColor="#F2F2F2"
      onHandleColor="#4CEAB1"
      disabled={disabled}
      className={className}
    />
  );
}
