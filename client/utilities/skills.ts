/**
 * @format
 */

import skillTypes from '../../shared/data/skillTypes.json';
import { SkillTypeInfo, TeamInfo } from '../../shared/types';

export const resolveSkillAreas = (team: TeamInfo | null | undefined) => {
  if (!team?.skillAreas) {
    return [];
  }

  const skillAreas = team.skillAreas.map((skillArea) => ({
    value: skillArea,
    label: skillArea
  }));

  return skillAreas;
};

export const resolveSkillTypes = (team: TeamInfo | null | undefined) => {
  const defaultSkillTypes: SkillTypeInfo[] = skillTypes.map((skillType) => {
    return {
      ...skillType,
      default: true
    };
  });

  if (!team?.skillTypes) {
    return defaultSkillTypes;
  }

  const teamSkillTypes: SkillTypeInfo[] = team.skillTypes.map((skillType) => {
    const { id: value, name: label, visualization } = skillType;

    return { value, label, visualization, team: team };
  });

  return [...defaultSkillTypes, ...teamSkillTypes];
};
