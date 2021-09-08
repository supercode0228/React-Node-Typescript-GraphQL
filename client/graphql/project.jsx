import gql from 'graphql-tag';

export const GET_PROJECT = gql`
  query getProject($id : ID, $accessKey : String) {
    project(id: $id, accessKey: $accessKey) {
      id
      accessKey
      name
      myRole
      startTime
      endTime
      about
      tags
      references
      draft
      creator {
        id
        name
        alias
        avatar
        jobTitle
      }
      users {
        user {
          id
          name
          alias
          avatar
          jobTitle
          me
        }
        role
      }
      team {
        id
        name
        alias
        avatar
      }
      skills {
        skill {
          id
          name
          icon
        }
        strength
      }
    }
  }
`;

export const GET_PROJECT_MEMBERS = gql`
  query getProjectMembers($id : ID!, $startTime : Float, $endTime : Float, $skills : [String!], $textFilter : String) {
    projectMembers(id: $id, startTime: $startTime, endTime: $endTime, skills: $skills, textFilter: $textFilter) {
      user {
        id
        name
        alias
        avatar
        jobTitle
      }
      external
      availability {
        startTime
        endTime
        type
        percentAway
        daysOfWeek
      }
      coveredSkills {
        skill {
          id
        }
      }
      avgAvailability
      fit
    }
  }
`;

export const GET_TEAM_PROJECTS = gql`
  query getTeamProjects($id : ID!) {
    teamProjects(id: $id) {
      project {
        id
        name
        startTime
        endTime
        draft
        myRole
        creator {
          id
        }
        users {
          user {
            id
            name
            avatar
            alias
          }
        }
      }
    }
  }
`;

export const SUGGEST_PROJECT_MEMBERS = gql`
  query suggestProjectMembers($id : ID!, $startTime : Float!, $endTime : Float!, $skills : [String!], $textFilter : String) {
    suggestProjectMembers(id: $id, startTime: $startTime, endTime: $endTime, skills: $skills, textFilter: $textFilter) {
      user {
        id
        name
        alias
        avatar
        jobTitle
      }
      external
      availability {
        startTime
        endTime
        type
        percentAway
        daysOfWeek
      }
      coveredSkills {
        skill {
          id
        }
      }
      avgAvailability
      fit
    }
  }
`;



export const GET_PROJECT_MEMBER_AVAILABILITY_TIMELINE = gql`
  query getProjectMemberAvailabilityTimeline($id : ID!, $accessKey : String, $startTime : Float!, $endTime : Float!, $users: [String!]) {
    projectMemberAvailabilityTimeline(id: $id, accessKey: $accessKey, startTime: $startTime, endTime: $endTime, users: $users) {
      startTime
      endTime
      daysOfWeek
      percentAway
      type
    }
  }
`;

export const UPDATE_PROJECT_DATA = gql`
  mutation updateProjectData($data: ProjectInput!, $team: String) {
    updateProjectData(data: $data, team: $team) {
      id
      name
      about
    }
  }
`;

export const SET_PROJECT_MEMBERS = gql`
  mutation setProjectMembers($projectId : ID!, $users : [ID!]) {
    setProjectMembers(projectId: $projectId, users: $users)
  }
`;

export const REMOVE_PROJECT = gql`
  mutation removeProject($id : ID!) {
    removeProject(id: $id)
  }
`;

export const REMOVE_PROJECT_MEMBER = gql`
  mutation removeProjectMember($projectId: ID!, $userId: ID!) {
    removeProjectMember(projectId: $projectId, userId: $userId)
  }
`;
