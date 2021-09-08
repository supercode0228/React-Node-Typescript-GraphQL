import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useDebouncedCallback } from 'use-debounce';

import { CHECK_CREDENTIALS_AVAILABLE } from '../graphql/user';
import { CHECK_TEAM_CREDENTIALS_AVAILABLE } from '../graphql/team';
import { resolveQuery } from '../util/graphqlHelpers';
import FieldValidityIndicator from './FieldValidityIndicator';

interface Props {
  className? : string;
  value? : string;
  onChange : (value : string) => void;
  field : string;
  placeholder : string;
  label? : string;
  currentEntityId? : string;
  entityType? : string;
};

const AvailableCredentialsInput = ({
  className,
  value, 
  onChange, 
  field, 
  placeholder, 
  label,
  currentEntityId, 
  entityType
} : Props) => {
  const [ debouncedValue, setDebouncedValue ] = useState(value);
  const { loading, data: availabilityData } = useQuery(
    entityType === 'team' ? CHECK_TEAM_CREDENTIALS_AVAILABLE : CHECK_CREDENTIALS_AVAILABLE, {
    variables: {
      [field]: debouncedValue,
      id: currentEntityId,
    },
  });
  const credentialsAvailable = useMemo(
    resolveQuery<boolean>(
      availabilityData, 
      entityType === 'team' ? 'checkTeamCredentialsAvailable' : 'checkCredentialsAvailable', 
      false
    ), [availabilityData]
  );

  const [ checkCredentialsTaken, ] = useDebouncedCallback((value: string) => {
    setDebouncedValue(value);
  }, 500);

  useEffect(
    () => {
      checkCredentialsTaken(value || '');
    },
    [value]
  )
  
  return (
    <div className={`input-group field-${field}` + (className ? (" " + className) : "")}>
      {label &&
        <div className="input-label">{label}</div>
      }
      {field === 'alias' &&
        <span className="prefix">/</span>
      }
      <input 
        type={field === 'login' ? 'email' : "text"} 
        value={value} 
        onChange={(evt) => onChange(evt.target.value)} 
        placeholder={placeholder}
        spellCheck={false}
      />
      <FieldValidityIndicator
        visible={(value?.length || 0) > 0}
        loading={loading || value !== debouncedValue}
        valid={credentialsAvailable}
      />
    </div>
  );
};

export default AvailableCredentialsInput;
