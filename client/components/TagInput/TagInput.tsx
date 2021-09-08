/**
 * @format
 */

import React from 'react';
import { Input, InputProps } from '../Input';
import { Stack } from '../Stack';
import { Tag } from '../Tag';

export interface TagInputProps extends InputProps {
  /**
   * Tags
   * @default []
   */
  tags?: string[];
  /** Callback when tag is added */
  onTagAdded?: (tags: string[]) => void;
  /** Callback when tag is removed */
  onTagRemoved?: (tags: string[]) => void;
}

export function TagInput({
  label,
  placeholder,
  value,
  disabled,
  tags = [],
  onChange,
  onTagAdded,
  onTagRemoved
}: TagInputProps) {
  function removeTag(index: number) {
    if (tags) {
      let newTags = [...tags];
      newTags.splice(index, 1);
      onTagRemoved?.(newTags);
    }
  }

  function handleKeyUp(event: React.KeyboardEvent) {
    if (event.key === 'Enter' && value) {
      let newTags = [...tags];
      newTags.push(value.toString());
      onTagAdded?.(newTags);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Backspace' && tags.length && !value) {
      const lastIndex = tags.length - 1;
      removeTag(lastIndex);
    }
  }

  const tagsMarkup = tags.length > 0 && (
    <Stack spacing="tight">
      {tags.map((tag, index) => (
        <Tag key={index} color="blue" onRemove={() => removeTag(index)}>
          {tag}
        </Tag>
      ))}
    </Stack>
  );

  const placeholderText = !tags?.length ? placeholder : undefined;

  return (
    <Input
      label={label}
      placeholder={placeholderText}
      value={value}
      disabled={disabled}
      prefix={tagsMarkup}
      onKeyUp={handleKeyUp}
      onKeyDown={handleKeyDown}
      onChange={onChange}
    />
  );
}
