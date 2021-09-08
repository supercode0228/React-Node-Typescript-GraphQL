/**
 * @format
 */

import React from 'react';
import uniqid from 'uniqid';
import { classNames, variationName } from '../../utilities/css';
import { ControlAppearance } from '../../types';
import { Icon } from '../Icon';
import { InlineError } from '../InlineError';
import { Label } from '../Label';
import styles from './Select.module.scss';

type Option = {
  /** Machine value of the option */
  value: string;
  /** Human-readable text for the option */
  label: string;
  /** Whether or not the option is hidden */
  hidden?: boolean;
};

export interface SelectProps {
  /**
   * ID for the select
   * @default uniqid()
   */
  id?: string;
  /** Label for the select */
  label?: string;
  /** Text to display as placeholder */
  placeholder?: string;
  /** Value */
  value?: string;
  /** List of options */
  options?: Option[];
  /** Whether or not the select is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /**
   * Appearance of the select
   * @default 'default'
   */
  appearance?: ControlAppearance;
  /** Callback when focus is removed */
  onBlur?: () => void;
  /** Callback when select is focussed */
  onFocus?: () => void;
  /** Callback when selection is changed */
  onChange?: (value: string) => void;
}

export function Select({
  id = uniqid(),
  label,
  placeholder,
  value,
  options,
  disabled,
  error,
  appearance = 'default',
  onBlur,
  onFocus,
  onChange
}: SelectProps) {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    onChange && onChange(event.currentTarget.value);
  }

  const className = classNames(
    styles.Select,
    disabled && styles.disabled,
    error && styles.error,
    appearance && styles[variationName('appearance', appearance)]
  );

  let normalizedOptions = options || [];

  if (placeholder) {
    normalizedOptions = [
      {
        label: placeholder,
        value: ''
      },
      ...normalizedOptions
    ];
  }

  const labelMarkup = label && <Label id={id}>{label}</Label>;

  const selectedOption = getSelectedOption(normalizedOptions, value);

  const contentMarkup = (
    <div className={styles.Content}>
      <span className={styles.SelectedOption}>{selectedOption}</span>

      <span>
        <Icon source="chevronDown" size="small" />
      </span>
    </div>
  );

  const optionsMarkup = normalizedOptions.map(renderOption);

  const errorMarkup = error && <InlineError>{error}</InlineError>;

  return (
    <>
      {labelMarkup}

      <div className={className}>
        <select
          id={id}
          value={value}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={handleChange}
          className={styles.Element}
        >
          {optionsMarkup}
        </select>

        {contentMarkup}

        <div className={styles.Backdrop} />
      </div>

      {errorMarkup}
    </>
  );
}

function getSelectedOption(options: Option[], value?: string): string {
  let selectedOption = options.find((option) => value === option.value);

  if (selectedOption === undefined) {
    // Get the first visible option (not the hidden placeholder)
    selectedOption = options.find((option) => !option.hidden);
  }

  return selectedOption ? selectedOption.label : '';
}

function renderOption(option: Option): React.ReactNode {
  const { value, label, ...rest } = option;

  return (
    <option key={value} value={value} {...rest}>
      {label}
    </option>
  );
}
