import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import classNames from 'classnames';
import moment from 'moment';

import styles from './OngoingProjectSummary.module.scss';
import { ResolvedUserSkill, TeamSkillsInfo, ProjectMemberInfo, UserAvailabilityInfo, ProjectInfo } from '../../shared/types';
import { resolveQuery } from '../util/graphqlHelpers';
import { SUGGEST_PROJECT_MEMBERS, GET_PROJECT } from '../graphql/project';
import { teamAvatarUrl, userAvatarUrl } from '../util/profile';
import { BubbleSkillsDisplay } from './BubbleSkillsDisplay';
import { ProjectSkillsDisplay } from './ProjectSkillsDisplay';

interface Props {
  id : string;
};

const OngoingProjectSummary = ({ id } : Props) => {
  const { data } = useQuery(GET_PROJECT, {
    variables: { id },
  });
  const projectInfo = useMemo(resolveQuery<ProjectInfo | null>(data, 'project', null), [data]);

  return (
    <>
    {projectInfo &&
      <div className="tile">
        <div className={classNames("extruded-surface", "medium", styles.wrapper)}>
          <img className={styles.teamAvatar} src={teamAvatarUrl(projectInfo.team)} />
          <div className={styles.titleHint}>Ongoing project</div>

          <Link href={`/project/${projectInfo.id}`}>
            <a><div className={styles.name}>{projectInfo.name}</div></a>
          </Link>
          {projectInfo.tags?.map((tag, i) =>
            <div key={i} className={styles.tag}>{tag}</div>
          )}
          <BubbleSkillsDisplay
            skills={projectInfo.skills as ResolvedUserSkill[]}
          />

          <div className={styles.sectionName}>Your team collectively knows</div>
          <ProjectSkillsDisplay project={projectInfo} skillType="software" visualization="tags" />

          <div className={styles.sectionName}>Team</div>
          <div className={styles.members}>
            {projectInfo.users?.map((u, j) =>
              <Link key={j} href={`/user/${u.user.alias}`}>
              <a>
                <div
                  className={styles.memberAvatar}
                  style={{
                    backgroundImage: `url(${userAvatarUrl(u.user)})`,
                    backgroundSize: 'cover'
                  }}
                  title={u.user.name}
                />
              </a>
              </Link>
            )}
          </div>
        </div>
      </div>
    }
    </>
  );
};

export default OngoingProjectSummary;
