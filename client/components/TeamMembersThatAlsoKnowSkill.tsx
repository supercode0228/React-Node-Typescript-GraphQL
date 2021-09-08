import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { TeamInfo, ResolvedUserSkillWithUserInfo, UserInfo, Skill } from '../../shared/types';
import { resolveQuery } from '../util/graphqlHelpers';
import { GET_TEAM_SKILL } from '../graphql/skills';
import { GET_USER } from '../graphql/user';
import skillColorMap from '../../shared/data/skillColorMap.json';
import { userAvatarUrl, teamAvatarUrl } from '../util/profile';

interface Props {
  skill : Skill;
};

const TeamMembersThatAlsoKnowSkill = ({ skill } : Props) => {
  const { data: userInfoData } = useQuery(GET_USER);
  // console.log('userData', data)
  const userInfo = useMemo(resolveQuery<UserInfo | null>(userInfoData, 'user', null), [userInfoData]);

  const activeTeam = userInfo?.teams?.find(t => t.team.id === userInfo?.activeTeam);

  const { data } = useQuery(GET_TEAM_SKILL, {
    variables: { team: activeTeam?.team.id, skill: skill.id },
    skip: !activeTeam
  });
  const skills = useMemo(resolveQuery<ResolvedUserSkillWithUserInfo[]>(data, 'teamSkill', []), [data])
    .filter(s => s.user.id !== userInfo?.id);

  return (
    <div className="team-skill-also">
      <span style={{ whiteSpace: 'pre' }}>Team members that also know </span>
      <Link href={`/team/${activeTeam?.team.alias}/skill/${skill.id}`}>
        <a><span style={{ color: '#527aaa' }}>{skill.name}</span></a>
      </Link>
      <div className="users">
        {skills.length > 0 ?
          <>
            {skills.map((s, i) => 
              <Link href={`/user/${(s.user as UserInfo).alias}`}>
              <a>
              <div key={i} className="user">
                <div 
                  className="avatar" 
                  style={{
                    backgroundImage: `url(${userAvatarUrl(s.user)})`, 
                    backgroundSize: 'cover'
                  }}
                >
                  <div className="level" style={{ backgroundColor: skillColorMap[s.strength] }} />
                </div>
                {/* <div className="name">{(s.user as UserInfo)?.name}</div>
                <div className="job-title">{(s.user as UserInfo)?.jobTitle}</div> */}
              </div>
              </a>
              </Link>
            )}
          </>
        :
          <div style={{ fontWeight: 'normal', color: '#666' }}>No one</div>
        }
      </div>
      <div 
        className="team-avatar" 
        style={{
          backgroundImage: `url(${teamAvatarUrl(activeTeam?.team)})`, 
          backgroundSize: 'cover'
        }}
      />
    </div>
  );
};

export default TeamMembersThatAlsoKnowSkill;
