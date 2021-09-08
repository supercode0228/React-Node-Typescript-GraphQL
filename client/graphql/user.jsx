import gql from 'graphql-tag';

export const CHECK_CREDENTIALS_AVAILABLE = gql`
  query checkCredentialsAvailable($login : String, $alias : String) {
    checkCredentialsAvailable(login: $login, alias: $alias)
  }
`;

export const GET_USER = gql`
  query getUser($id : String, $alias : String) {
    user(id: $id, alias: $alias) {
      id
      name
      login
      authProvider
      emailVerified
      alias
      avatar
      me
      skillArea
      publicProfile
      about
      jobTitle
      location
      links
      references
      activeTeam
      teams {
        team {
          id
          name
          alias
          avatar
          locations
          skillAreas
        }
        role
        location
        skillArea
        directManager
      }
      projects {
        project {
          id
          name
          draft
          startTime
          endTime

          team {
            id
          }
        }
        role
      }
      pinnedSkillType
      jobExperience {
        team
        customName
        startTime
        endTime
      }
      projectUtilizationViewMonths
    }
  }
`;

export const GET_USER_AVAILABILITY = gql`
  query getUserAvailability {
    userAvailability {
      startTime
      endTime
      daysOfWeek
      percentAway
      type
    }
  }
`;

export const GET_SUGGESTED_BLOGS = gql`
  query getSuggestedBlogs {
    suggestedBlogs {
      name
      summary
      url
      thumbnail {
        url
      }
      bgColor
    }
  }
`;

export const GET_USER_AVAILABILITY_SUMMARY = gql`
  query getUserAvailabilitySummary($year: Int!) {
    userAvailabilitySummary(year: $year) {
      monthSummaries
      vacationDaysSet
      projectUtilization
    }
  }
`;

export const GET_PERSONAL_NOTES = gql`
  query getPersonalNotes {
    personalNotes {
      id
      msg
      createdTime
    }
  }
`;

export const UPDATE_USER_DATA = gql`
  mutation ($data: UserInput!) {
    updateUserData(data: $data) {
      id
      name
      alias
      # skillArea
      # publicProfile
      # about
      # jobTitle
      # location
      # links
      # references
      # activeTeam
    }
  }
`;

export const UPDATE_USER_AVAILABILITY = gql`
  mutation ($availability: [UserAvailabilityInput!]) {
    updateUserAvailability(availability: $availability) {
      startTime
      endTime
      daysOfWeek
      percentAway
      type
    }
  }
`;

export const ADD_PERSONAL_NOTE = gql`
  mutation ($msg: String!) {
    addPersonalNote(msg: $msg)
  }
`;
export const REMOVE_PERSONAL_NOTE = gql`
  mutation ($id: ID!) {
    removePersonalNote(id: $id)
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation {
    deleteAccount
  }
`;

export const REQUEST_RESET_PASSWORD = gql`
  mutation ($email: String!) {
    requestResetPassword(email: $email)
  }
`;

export const REQUEST_ACCOUNT_ACTIVATION = gql`
  mutation {
    requestAccountActivation
  }
`;

export const UPDATE_USER_TEAM_MUTATION = gql`
  mutation updateUserTeam($input: UserTeamInput!) {
    updateUserTeam(input: $input)
  }
`;
