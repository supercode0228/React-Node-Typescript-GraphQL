export interface UserInfo {
  id? : string;
  name : string;
  login? : string;
  authProvider? : string;
  emailVerified? : boolean;
  alias : string;
  avatar? : string;
  me? : boolean;
  skillArea : string;
  joinedMailingList?: boolean;
  publicProfile: boolean;
  about?: string;
  jobTitle?: string;
  location?: string;
  links?: string[];
  references?: string[];
  activeTeam?: string;
  teams?: UserTeamInfo[];
  projects?: UserProjectInfo[];
  pinnedSkillType? : string;
  jobExperience? : UserJobExperienceInfo[];
  projectUtilizationViewMonths? : number;
};

export interface UserJobExperienceInfo {
  team? : string | TeamInfo;
  customName? : string;
  startTime? : number;
  endTime? : number;
};

export interface BlogEntryInfo {
  name : string;
  summary : string;
  url : string;
  thumbnail? : {
    url? : string
  };
  bgColor? : string;
};

export interface UserAvailabilityInfo {
  startTime? : number;
  endTime? : number;
  daysOfWeek? : number[];
  percentAway? : number;
  type : string;
  saved? : boolean;
};

export interface UserAvailabilitySummaryInfo {
  monthSummaries : number[];
  vacationDaysSet : number;
  projectUtilization : number;
};

export interface PersonalNoteInfo {
  id : string;
  createdTime : number;
  msg : string;
}

export interface Skill {
  id : string;
  name : string;
  type : string;
  custom? : boolean;
  icon? : string;
};

export interface BaseUserSkill {
  strength : number;
  sortOrder? : number;
  modifiedTime? : number;
};

export interface UserSkill extends BaseUserSkill {
  skill : string;
};

export interface ResolvedUserSkill extends BaseUserSkill {
  user? : (string | UserInfo);
  skill : Skill;
};

export interface ResolvedUserSkillWithUserInfo extends BaseUserSkill {
  user : UserInfo;
  skill : Skill;
};

export interface ResolvedAggregatedSkill extends ResolvedUserSkill {
  strengths? : number[];
  userCount? : number;
  unavailableCount? : number;
};

export interface TeamSkillTypeInfo {
  id?: string,
  name?: string,
  visualization?: string,
  createdAt?: Date,
  updatedAt?: Date
}

export interface TeamSkillsInfo {
  skills : ResolvedAggregatedSkill[];
  userCount : number;
};

export interface TeamInfo {
  id? : string;
  name? : string;
  alias? : string;
  avatar? : string;
  about? : string;
  website? : string;
  myRole? : string;
  users? : UserTeamInfo[];
  invites? : TeamInviteInfo[];
  projects? : TeamProjectInfo[];
  locations?: string[];
  skillAreas?: string[];
  skillTypes?: TeamSkillTypeInfo[];
  plan?: string;
};

export interface TeamInvitationInfo {
  team : TeamInfo;
  email? : string;
}

export interface TeamInviteInfo {
  user? : UserInfo;
  email : string;
  key : string;
};

export interface UserTeamInfo {
  user: UserInfo;
  team: TeamInfo;
  role: string;
  external?: boolean;
  location?: string;
  skillArea?: string;
  directManager?: string[];
};

export interface ProjectInfo {
  id? : string;
  accessKey? : string;
  name : string;
  draft? : boolean;
  startTime? : number;
  endTime? : number;
  about?: string;
  tags?: string[];
  references?: string[];
  myRole?: string;
  creator?: UserInfo;
  users?: UserProjectInfo[];
  team?: TeamInfo;
  skills?: ResolvedUserSkill[];
};

export interface UserProjectInfo {
  user: UserInfo;
  project: ProjectInfo;
  role: string;
};

export interface ProjectMemberInfo {
  user : UserInfo;
  external? : boolean;
  availability : UserAvailabilityInfo[];
  avgAvailability : number;
  coveredSkills : ResolvedUserSkill[];
  fit : number;
};

export interface TeamProjectInfo {
  project: ProjectInfo;
  team: TeamInfo;
};

export interface SkillTypeInfo {
  value?: string;
  label?: string;
  visualization?: string;
  emotion?: string;
  introduction?: string;
  definition?: string;
  emptyDefinition?: string;
  examples?: any;
  default?: boolean;
  user?: UserInfo;
  team?: TeamInfo;
}
