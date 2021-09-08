/**
 * @format
 */

import { useQuery } from '@apollo/react-hooks';
import React, { useMemo } from 'react';
import { ProjectInfo, TeamSkillsInfo } from '../../../shared/types';
import { GET_PROJECT_SKILLS } from '../../graphql/skills';
import { resolveQuery } from '../../util/graphqlHelpers';
import { BubbleSkillsDisplay } from '../BubbleSkillsDisplay';
import { SectorSkillsDisplay } from '../SectorSkillsDisplay';
import { TagSkillsDisplay } from '../TagSkillsDisplay';

export interface ProjectSkillsDisplayProps {
  /** Project */
  project: ProjectInfo;
  /** Skill type */
  skillType: string;
  /** Visualization */
  visualization?: string;
  /** Scale */
  scale?: number;
  /** Large */
  large?: boolean;
}

export function ProjectSkillsDisplay({
  project,
  skillType,
  visualization,
  scale,
  large
}: ProjectSkillsDisplayProps) {
  const { data } = useQuery(GET_PROJECT_SKILLS, {
    variables: { project: project.id, type: skillType }
  });

  const projectSkills = useMemo(
    resolveQuery<TeamSkillsInfo | null>(data, 'projectSkills', null),
    [data]
  );

  const skills = projectSkills?.skills.map((skill) => skill) || [];

  return (
    <>
      {projectSkills && (
        <>
          {visualization === 'sector' && (
            <SectorSkillsDisplay skills={skills} scale={scale} large={large} />
          )}

          {visualization === 'bubbles' && (
            <BubbleSkillsDisplay skills={skills} scale={scale} large={large} />
          )}

          {visualization === 'tags' && (
            <TagSkillsDisplay skills={skills} skillType={skillType} />
          )}
        </>
      )}
    </>
  );
}
