/**
 * @format
 */

import { useQuery } from '@apollo/react-hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { CHECK_CREDENTIALS_AVAILABLE } from '../../graphql/user';
import { CHECK_TEAM_CREDENTIALS_AVAILABLE } from '../../graphql/team';
import { resolveQuery } from '../../util/graphqlHelpers';
import { Input, InputProps } from '../Input';

type EntityType = 'user' | 'team';

export interface CredentialAvailabilityInputProps extends InputProps {
  /** Entity type */
  entityType: EntityType;
  /** Entity identifier */
  entityId?: string;
  /** Field to check credential availability */
  field: string;
}

export function CredentialAvailabilityInput({
  label,
  placeholder,
  type,
  value,
  prefix,
  entityType,
  entityId,
  field,
  onChange
}: CredentialAvailabilityInputProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const { loading, data } = useQuery(
    entityType === 'team'
      ? CHECK_TEAM_CREDENTIALS_AVAILABLE
      : CHECK_CREDENTIALS_AVAILABLE,
    {
      variables: {
        [field]: debouncedValue,
        id: entityId
      }
    }
  );

  const credentialsAvailable = useMemo(
    resolveQuery<boolean>(
      data,
      entityType === 'team'
        ? 'checkTeamCredentialsAvailable'
        : 'checkCredentialsAvailable',
      false
    ),
    [data]
  );

  const [checkCredentialsTaken] = useDebouncedCallback(
    (value: string | number) => {
      setDebouncedValue(value);
    },
    500
  );

  useEffect(() => {
    if (value) {
      checkCredentialsTaken(value);
    }
  }, [value]);

  const isVisible = value ? value.toString().length > 0 : false;
  const isLoading = loading || value !== debouncedValue;

  const markup = isLoading ? (
    <img className="icon" src="/icons/field-loading.svg" />
  ) : (
    <img
      className="icon"
      src={`/icons/field-${credentialsAvailable ? 'check' : 'cross'}.svg`}
    />
  );

  const indicatorMarkup = isVisible && markup;

  return (
    <Input
      label={label}
      placeholder={placeholder}
      type={type}
      value={value}
      prefix={prefix}
      suffix={indicatorMarkup}
      onChange={onChange}
    />
  );
}
