import gql from 'graphql-tag';

export const CHECK_TEAM_CREDENTIALS_AVAILABLE = gql`
  query checkTeamCredentialsAvailable($id : ID, $alias : String) {
    checkTeamCredentialsAvailable(id: $id, alias: $alias)
  }
`;

export const GET_TEAM = gql`
  query getTeam($id : ID, $alias : String) {
    team(id: $id, alias: $alias) {
      id
      name
      alias
      avatar
      myRole
      about
      website
      locations
      skillAreas
      plan
      users {
        user {
          id
          name
          jobTitle
        }
        role
        external
      }
      projects {
        project {
          id
          name
          startTime
          endTime
          draft

          users {
            user {
              id
              name
              avatar
            }
          }
        }
      }
      invites {
        user {
          id
          name
          jobTitle
        }
        email
        key
      }
      skillTypes {
        id
        name
        visualization
      }
    }
  }
`;

export const GET_TEAM_MEMBERS = gql`
  query getTeamMembers($id : ID, $alias : String, $skillArea : String, $textFilter : String) {
    teamMembers(id: $id, alias: $alias, skillArea: $skillArea, textFilter: $textFilter) {
      user {
        id
        name
        alias
        avatar
        jobTitle
        me
      }
      role
      external
      directManager
      skillArea
    }
  }
`;

export const GET_INVITATION_INFO = gql`
  query getInvitationInfo($key : String!) {
    invitationInfo(key: $key) {
      team {
        id
        name
        alias
        avatar
      }
      email
    }
  }
`;

export const UPDATE_TEAM_DATA = gql`
  mutation updateTeamData($data: TeamInput!) {
    updateTeamData(data: $data) {
      id
      name
      alias
      about
    }
  }
`;

export const DELETE_TEAM = gql`
  mutation deleteTeam($id: ID!) {
    deleteTeam(id: $id)
  }
`;

export const TEAM_INVITE = gql`
  mutation teamInvite($id: ID!, $emails: [String!]) {
    teamInvite(id: $id, emails: $emails)
  }
`;

export const TEAM_INVITE_LINK = gql`
  mutation teamInviteLink($id: ID!) {
    teamInviteLink(id: $id)
  }
`;

export const CANCEL_TEAM_INVITE = gql`
  mutation cancelTeamInvite($key: String!) {
    cancelTeamInvite(key: $key)
  }
`;

export const UPDATE_TEAM_MEMBER = gql`
  mutation updateTeamMember($data: TeamMemberInput!) {
    updateTeamMember(data: $data)
  }
`;

export const REMOVE_TEAM_MEMBER = gql`
  mutation removeTeamMember($teamId: ID!, $userId: ID!) {
    removeTeamMember(teamId: $teamId, userId: $userId)
  }
`;

export const TEAM_SKILL_TYPES_QUERY = gql`
  query teamSkillTypes($teamId: ID!) {
    teamSkillTypes(teamId: $teamId) {
      id
      name
      visualization
      team
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TEAM_SKILL_TYPE_MUTATION = gql`
  mutation updateTeamSkillType($teamId: ID!, $input: TeamSkillTypeInput!) {
    updateTeamSkillType(teamId: $teamId, input: $input) {
      id
      name
      visualization
    }
  }
`;

export const DELETE_TEAM_SKILL_TYPE_MUTATION = gql`
  mutation deleteTeamSkillType($teamId: ID!, $id: ID!) {
    deleteTeamSkillType(teamId: $teamId, id: $id)
  }
`;
