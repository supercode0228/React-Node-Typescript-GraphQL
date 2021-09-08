/**
 * @format
 */

import React from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { ActionList } from '../ActionList';
import { Input } from '../Input';
import { Popover } from '../Popover';
import { TagInput } from '../TagInput';

export interface PlacesAutocompleteProps {
  /** Label of the places autocomplete */
  label?: string;
  /** Text to display as placeholder */
  placeholder?: string;
  /** Value */
  value?: string | string[];
  /** Whether or not to accept multiple places */
  multiple?: boolean;
  /** Callback when place is changed */
  onChange?: (value: string | string[]) => void;
}

export function PlacesAutocomplete({
  label,
  placeholder,
  value,
  multiple,
  onChange
}: PlacesAutocompleteProps) {
  const {
    ready,
    value: query,
    setValue: setQuery,
    suggestions: { status, data },
    clearSuggestions
  } = usePlacesAutocomplete({ debounce: 300 });

  function handleSelect(place: string) {
    setQuery('', false);

    if (multiple) {
      let places = [...(value as string[])];
      places.push(place);
      onChange?.(places);
    } else {
      onChange?.(place);
    }

    clearSuggestions();
  }

  const isDisabled = !ready;

  return (
    <Popover
      active={status === 'OK' && data.length > 0}
      activator={
        <div>
          {multiple ? (
            <TagInput
              label={label}
              placeholder={placeholder}
              value={query}
              disabled={isDisabled}
              tags={value as string[]}
              onChange={(value) => setQuery(value)}
              onTagRemoved={(places) => onChange?.(places)}
            />
          ) : (
            <Input
              label={label}
              placeholder={placeholder}
              value={query || (value as string)}
              disabled={isDisabled}
              onChange={(value) => {
                setQuery(value);

                if (!value.length) {
                  onChange?.('');
                }
              }}
            />
          )}
        </div>
      }
      placement="bottom-start"
      onClose={() => setQuery('')}
    >
      <ActionList
        items={data.map((suggestion) => {
          const { description } = suggestion;

          return {
            content: description,
            onClick: () => handleSelect(description)
          };
        })}
      />
    </Popover>
  );
}
