import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import classNames from 'classnames';

import styles from './SuggestedProjectMembers.module.scss';
import { ResolvedUserSkill, TeamSkillsInfo, ProjectMemberInfo } from '../../shared/types';
import { resolveQuery } from '../util/graphqlHelpers';
import { SUGGEST_PROJECT_MEMBERS } from '../graphql/project';
import ProjectMemberList from './ProjectMemberList';

interface Props {
  projectId : string;
  skills : string[];
  startTime : number;
  endTime : number;
  selectedMembers : string[];
  onAdd? : (member : ProjectMemberInfo) => void;
  onRemove? : (id : string) => void;
};

const SuggestedProjectMembers = ({ projectId, skills, startTime, endTime, selectedMembers, onAdd, onRemove } : Props) => {
  const [ query, setQuery ] = useState('');

  const { data } = useQuery(SUGGEST_PROJECT_MEMBERS, {
    variables: { id: projectId, skills, startTime, endTime, textFilter: query },
    // fetchPolicy: "network-only",
  });
  const suggestedMembers = useMemo(resolveQuery<ProjectMemberInfo[] | null>(data, 'suggestProjectMembers', []), [data]);

  return (
    <div className={styles.suggestedProjectMembers}>
      <div className={classNames("input-group", "big", styles.search)}>
        <img 
          className="icon" 
          src="/icons/search.svg"
        />
        <input 
          type='text'
          className="skill-search-bar" 
          value={query} 
          onChange={evt => setQuery(evt.target.value)} 
          placeholder="Search members" 
          // autoFocus
        />
        <img 
          className="icon-right" 
          src="/icons/cross-big.svg"
          style={{
            visibility: (query !== '') ? 'visible' : 'hidden', 
            cursor: 'pointer', 
            top: '5px'
          }}
          onClick={evt => setQuery('')}
        />
      </div>
      <ProjectMemberList
        members={suggestedMembers || []}
        {...{ selectedMembers, onAdd, onRemove }}
      />
    </div>
  );
};

export default SuggestedProjectMembers;
