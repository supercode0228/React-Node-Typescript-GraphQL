import { withApollo } from '../../../../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/react-hooks';
import classNames from 'classnames';

import '../../../app.scss';
import danGroups from '../../../../shared/data/skillDanGroups.json';
import skillColorMap from '../../../../shared/data/skillColorMap.json';
import { resolveQuery } from '../../../../client/util/graphqlHelpers';
import { GET_TEAM } from '../../../../client/graphql/team';
import { HelpButton, TopBar } from '../../../../client/components';
import { TeamInfo, ResolvedUserSkill, UserInfo } from '../../../../shared/types';
import TeamHeader from '../../../../client/components/TeamHeader';
import skillTypes from '../../../../shared/data/skillTypes.json';
import { GET_TEAM_SKILL } from '../../../../client/graphql/skills';
import { ensureAccess } from '../../../../client/util/accessControl';
import { userAvatarUrl } from '../../../../client/util/profile';

const TeamSkillInfoPage = () => {
  const router = useRouter();

  const [ textFilter, setTextFilter ] = useState('');
  const [ sortBy, setSortBy ] = useState({ order: -1 });

  const { data: teamData, error } = useQuery(GET_TEAM, {
    variables: { alias: router.query.alias },
  });
  ensureAccess(error);
  const teamInfo = useMemo(resolveQuery<TeamInfo | null>(teamData, 'team', null), [teamData]);
  const { data } = useQuery(GET_TEAM_SKILL, {
    variables: { team: teamInfo?.id, skill: router.query.skill },
    skip: !teamInfo
  });
  const skills = useMemo(resolveQuery<ResolvedUserSkill[]>(data, 'teamSkill', []), [data]);
  const skill = skills?.[0];

  const maxStrength = Math.max(...skills.map(s => s.strength));

  const externalMembers = new Set(teamInfo?.users?.filter(u => u.external).map(u => u.user.id));
  const internalSkills : ResolvedUserSkill[] = [];
  const externalSkills : ResolvedUserSkill[] = [];
  skills
    .filter(s => textFilter.length > 0
      ? ((s.user as UserInfo).name.toLowerCase().includes(textFilter.toLowerCase()) || (s.user as UserInfo).jobTitle?.toLowerCase().includes(textFilter.toLowerCase()))
      : true
    )
    .slice()
    .sort((a, b) => (a.strength - b.strength) * sortBy.order)
    .forEach(s => {
    if(externalMembers.has((s.user as UserInfo).id))
      externalSkills.push(s);
    else
      internalSkills.push(s);
  });

  const skillTile = (s : ResolvedUserSkill, i : number) => (
    <div
      key={i}
      className="team-skill-user"
      style={{
        borderTop: skill?.skill.type === 'software' ? `2px solid ${skillColorMap[s.strength]}` : '',
      }}
    >
      {(s.user as UserInfo)?.me &&
        <div className="role-indicator">You</div>
      }
      <div
        className="avatar"
        style={{
          backgroundImage: `url(${userAvatarUrl(s.user as UserInfo)})`,
          backgroundSize: 'cover'
        }}
      />
      <div className="info">
        <div className="name">
          <Link href={`/user/${(s.user as UserInfo)?.alias}`}>
            <a>{(s.user as UserInfo)?.name}</a>
          </Link>
        </div>
        <div className="job-title">{(s.user as UserInfo)?.jobTitle}</div>
      </div>
      <div className={classNames("level", { softwareLevel: skill?.skill.type === 'software' })}>
        {skill?.skill.type === 'software'
          ? <div className="software-level">
              <div
                className="level-list"
              >
                {danGroups.map((g, i) =>
                  <div key={i} className="belt-color-group">
                    <div className="belt-colors">
                      {g.skillLevels.map((l, j) =>
                        <div
                          key={j}
                          className={classNames(
                            'belt-color',
                            { selected: l === s.strength },
                          )}
                        >
                          <div
                            className={classNames(
                              'circle',
                              // { selected: l === skill.strength },
                            )}
                            style={{
                              backgroundColor: skillColorMap[l],
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="level-name">{ danGroups[Math.floor(s.strength / 3)].name }</div>
            </div>
          : <div className="bubble" style={{ transform: `scale(${s.strength / maxStrength})` }} />
        }
      </div>
      <div style={{ clear: 'both' }} />
    </div>
  )

  return (
    <>
      <Head>
        <title>{`${skill?.skill.name} users in ${teamInfo?.name}`}</title>
      </Head>
      <TopBar />
      {(teamInfo && skill) &&
      <>
        <div className="header team-skill-drilldown">
          <div className="container">
            <div className="block-left">
              <div className="aligner">
                <Link href={`/team/${teamInfo.alias}`}>
                  <a className="back">
                    <img src="/icons/arrow-medium-left.svg" />
                    <span>Back</span>
                  </a>
                </Link>
                <div className="avatar-container">
                  {skill.skill.type === 'software'
                    ? <div
                        className="avatar"
                        style={{
                          backgroundImage: `url(data:image/png;base64,${skill.skill.icon})`,
                          backgroundSize: 'cover',
                          border: 'none'
                        }}
                      />
                    : <div className="name">{skill.skill.name}</div>
                  }
                </div>
              </div>
            </div>

            <div className="block-center">
              <div className="aligner page-desc">
                Showing you all team members that are associated with this {skillTypes.find(t => t.value === skill.skill.type)?.labelSingular.toLowerCase()}
              </div>
            </div>

            <div className="block-right">
              <div className="aligner">
                <div className="stats">
                  <div className="stat">
                    <span className="value">{skills?.length || 0}</span>
                    <span className="label"> Members</span>
                  </div>

                  <div className="stat">
                    <span className="value">{externalMembers.size || 0}</span>
                    <span className="label"> External</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="slim-header team-skill-drilldown">
          <div className="slim-container">
            <div className="input-group">
              <img className="icon-left" src="/icons/search.svg" />
              <input
                type='text'
                placeholder='Search members'
                value={textFilter}
                onChange={evt => setTextFilter(evt.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="slim-container team-skill-drilldown">
          <div className="list-header">
            <div className="name">Name</div>
            <div className="job-title">Job Title</div>
            <div className="level">
              {skill?.skill.type === 'software' ? 'Skill Level' : 'Interest Level'}

              {sortBy.order > 0 ?
                <img className="sort-order" src="/icons/arrow-up.svg" onClick={evt => setSortBy({ ...sortBy, order: -1 })} />
              :
                <img className="sort-order" src="/icons/arrow-down.svg" onClick={evt => setSortBy({ ...sortBy, order: 1 })} />
              }
            </div>
          </div>

          {internalSkills.map((s, i) =>
            skillTile(s, i)
          )}

          {externalSkills.length > 0 &&
          <>
            <div className="body-spacer">
              <div className="title">External</div>
              <div className="spacer" />
            </div>
            <div style={{ clear: 'both' }} />

            {externalSkills.map((s, i) =>
              skillTile(s, i)
            )}
          </>}
        </div>
      </>
      }

      <HelpButton />
    </>
  );
}

export default withApollo(TeamSkillInfoPage);
