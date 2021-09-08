import gql from 'graphql-tag';

export const FIND_SKILLS = gql`
  query findSkills($type : String, $name : String, $exclude: [String!], $limit : Int, $exact: Boolean, $onlyTypes: [String!]) {
    skills(type: $type, name: $name, exclude: $exclude, limit: $limit, exact: $exact, onlyTypes: $onlyTypes) {
      id
      name
      type
      icon
    }
  }
`;

export const GET_USER_SKILLS = gql`
  query getUserSkills($type : String!, $userId : String) {
    userSkills(type: $type, userId: $userId) {
      skill {
        id
        name
        type
        icon
      }
      strength
      modifiedTime
    }
  }
`;

export const GET_TEAM_SKILLS = gql`
  query getTeamSkills($type : String!, $team : ID!, $skillArea : String, $textFilter : String, $showing: String) {
    teamSkills(type: $type, team: $team, skillArea: $skillArea, textFilter: $textFilter, showing: $showing) {
      skills {
        skill {
          id
          name
          type
          icon
        }
        strength
        userCount
        unavailableCount
      }
    	userCount
    }
  }
`;

export const GET_TEAM_SKILL = gql`
  query getTeamSkill($skill : String!, $team : ID!) {
    teamSkill(skill: $skill, team: $team) {
      skill {
        id
        name
        icon
        type
      }
      user {
        id
        name
        avatar
        alias
        jobTitle
        me
      }
      strength
    }
  }
`;

export const GET_PROJECT_SKILLS = gql`
  query getProjectSkills($type : String!, $project : ID!, $accessKey : String) {
    projectSkills(type: $type, project: $project, accessKey: $accessKey) {
      skills {
        skill {
          id
          name
          type
          icon
        }
        strength
        strengths
        userCount
      }
    	userCount
    }
  }
`;

export const UPDATE_USER_SKILLS = gql`
  mutation updateUserSkills($type : String!, $skills : [AssignedSkillInput!]) {
    updateUserSkills(type: $type, skills: $skills) {
      skill {
        id
        name
      }
      strength
    }
  }
`;

export const ADD_CUSTOM_SKILL = gql`
  mutation addCustomSkill($data : SkillInput!) {
    addCustomSkill(data: $data) {
      id
      name
      icon
      type
    }
  }
`;

export const CREATE_TEAM_SKILLS_MUTATION = gql`
  mutation createTeamSkills($teamId: ID!, $input: TeamSkillsInput!) {
    createTeamSkills(teamId: $teamId, input: $input)
  }
`;

export const DELETE_TEAM_SKILLS_MUTATION = gql`
  mutation deleteTeamSkills($teamId: ID!, $ids: [ID!]) {
    deleteTeamSkills(teamId: $teamId, ids: $ids)
  }
`;
