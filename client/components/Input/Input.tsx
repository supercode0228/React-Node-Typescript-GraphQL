/**
 * @format
 */

import React, { createElement, useRef } from 'react';
import uniqid from 'uniqid';
import { classNames, variationName } from '../../utilities/css';
import { ControlAppearance } from '../../types';
import { InlineError } from '../InlineError';
import { Label } from '../Label';
import { Stack } from '../Stack';
import { TextStyle } from '../TextStyle';
import styles from './Input.module.scss';

type Type = 'text' | 'email' | 'number' | 'password' | 'search';

type Size = 'subheading' | 'title';

export interface InputProps {
  /**
   * ID for the input
   * @default uniqid()
   */
  id?: string;
  /** Label for the input */
  label?: string;
  /** Text to display as placeholder */
  placeholder?: string;
  /**
   * Type of the input
   * @default 'text'
   */
  type?: Type;
  /** Value */
  value?: string | number;
  /** Whether or not the input is multiline */
  multiline?: boolean;
  /** Maximum character length for the input */
  maxLength?: number;
  /** Whether or not the input is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /**
   * Appearance of the input
   * @default 'default'
   */
  appearance?: ControlAppearance;
  /** Override input size */
  size?: Size;
  /** Content to display before input */
  prefix?: React.ReactNode;
  /** Content to display after input */
  suffix?: React.ReactNode;
  /** Callback when key is released */
  onKeyUp?: (event: React.KeyboardEvent) => void;
  /** Callback when key is pressed */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /** Callback when focus is removed */
  onBlur?: () => void;
  /** Callback when input is focused */
  onFocus?: () => void;
  /** Callback when value is changed */
  onChange?: (value: string) => void;
}

export function Input({
  id = uniqid(),
  label,
  placeholder,
  type = 'text',
  value,
  multiline,
  maxLength,
  disabled,
  error,
  appearance = 'default',
  size,
  prefix,
  suffix,
  onKeyUp,
  onKeyDown,
  onBlur,
  onFocus,
  onChange
}: InputProps) {
  const elementRef = useRef<HTMLInputElement>(null);

  function focus() {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange && onChange(event.currentTarget.value);
  }

  const className = classNames(
    styles.Input,
    disabled && styles.disabled,
    error && styles.error,
    appearance && styles[variationName('appearance', appearance)],
    size && styles[variationName('size', size)]
  );

  const labelMarkup = label && <Label id={id}>{label}</Label>;
  const prefixMarkup = prefix && <div className={styles.Prefix}>{prefix}</div>;
  const suffixMarkup = suffix && <div className={styles.Suffix}>{suffix}</div>;
  const errorMarkup = error && <InlineError>{error}</InlineError>;

  const normalizedValue = typeof value === 'string' ? value : '';

  const elementClassName = classNames(
    styles.Element,
    multiline && styles['Element-multiline']
  );

  const elementMarkup = createElement(multiline ? 'textarea' : 'input', {
    ref: elementRef,
    id,
    placeholder,
    type,
    value: normalizedValue,
    maxLength,
    disabled,
    onKeyUp,
    onKeyDown,
    onBlur,
    onFocus,
    onChange: handleChange,
    className: elementClassName
  });

  return (
    <>
      {maxLength ? (
        <Stack alignment="center">
          <Stack.Item fill={true}>{labelMarkup}</Stack.Item>

          <Stack.Item>
            <TextStyle subdued={true}>
              <strong>{maxLength - normalizedValue.length}</strong>
            </TextStyle>
          </Stack.Item>
        </Stack>
      ) : (
        labelMarkup
      )}

      <div className={className} onClick={focus}>
        {prefixMarkup}
        {elementMarkup}
        {suffixMarkup}

        <div className={styles.Backdrop} />
      </div>

      {errorMarkup}
    </>
  );
}
