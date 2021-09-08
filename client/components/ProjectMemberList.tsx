import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import classNames from 'classnames';

import styles from './ProjectMemberList.module.scss';
import { ResolvedUserSkill, TeamSkillsInfo, ProjectMemberInfo } from '../../shared/types';
import { resolveQuery } from '../util/graphqlHelpers';
import { SUGGEST_PROJECT_MEMBERS } from '../graphql/project';
import { userAvatarUrl } from '../util/profile';
import { maybeClipStr } from '../../shared/util/str';

interface Props {
  members : ProjectMemberInfo[];
  selectedMembers? : string[];
  onAdd? : (member : ProjectMemberInfo) => void;
  onRemove? : (id : string) => void;
};

const ProjectMemberList = ({ members, selectedMembers, onAdd, onRemove } : Props) => {
  return (
    <div className={styles.projectMemberList}>
    {members?.map((member, i) => {
      const memberSelected = selectedMembers?.includes(member.user.id || '');
      return (
        <div
          key={i}
          className={classNames(styles.member, { [styles.selected]: memberSelected })}
          onClick={evt => (memberSelected || !selectedMembers) ? onRemove?.(member.user.id || '') : onAdd?.(member)}
        >
          <div 
            className={styles.avatar}
            style={{
              backgroundImage: `url(${userAvatarUrl(member.user)})`, 
              backgroundSize: 'cover'
            }}
          >
            <div className={styles.avgAvailability}>
              <div className={styles.availabilityMeter} style={{ height: `${member.avgAvailability * 100}%` }} />
              <div className={styles.percent}>{`${Math.round(member.avgAvailability * 100)}%`}</div>
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.name} title={member.user.name}>{maybeClipStr(member.user.name, 15)}</div>
            <div className={styles.jobTitle} title={member.user.jobTitle}>{maybeClipStr(member.user.jobTitle, 25)}</div>
          </div>
          {selectedMembers &&
            <img className={classNames(styles.plusBtn)} src={`/icons/${memberSelected ? 'checkmark-green-large' : 'plus-grey-large'}.svg`} />
          }
        </div>
      );
    })}
    </div>
  );
};

export default ProjectMemberList;
