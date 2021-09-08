import mongoose, { Schema } from 'mongoose';
import skillAreas from '../../shared/data/skillAreas.json';

import { dev, MongoUri } from '../config';

/*
 * User
 */
export interface IUser extends mongoose.Document {
  login: string;
  pass: string;
  authProvider? : string;
  emailVerified : boolean;
  name: string;
  alias: string;
  avatar?: string
  me?: boolean;
  skillArea: string;
  joinedMailingList: boolean;
  publicProfile: boolean;
  about: string;
  jobTitle: string;
  location: string;
  links: string[];
  references: string[];
  activeTeam: string;
  teams: (string | IUserTeam)[];
  projects: (string | IUserProject)[];
  pinnedSkillType? : string;
  jobExperience : IUserJobExperience[];
  projectUtilizationViewMonths? : number;
};
export interface IUserJobExperience {
  team? : string | ITeam;
  customName? : string;
  startTime? : number;
  endTime? : number;
};
const UserSchema = new Schema({
  login : { type: String, required: true, lowercase: true },
  pass : { type: String },
  authProvider : { type: String },
  emailVerified : { type: Boolean },
  name : { type: String },
  alias : { type: String, required: true, lowercase: true },
  avatar : { type: String },
  skillArea : { type: String },
  joinedMailingList : { type: Boolean },
  publicProfile : { type: Boolean },
  about : { type: String },
  jobTitle : { type: String },
  location : { type: String },
  links : { type: [String] },
  references : { type: [String] },
  activeTeam : { type: Schema.Types.ObjectId, ref: 'Team' },
  pinnedSkillType : { type: String },
  jobExperience : [
    {
      team : { type: Schema.Types.ObjectId, ref: 'Team' },
      customName : { type: String },
      startTime : { type: Number },
      endTime : { type: Number },
    }
  ],
  projectUtilizationViewMonths : { type: Number, default: 12 },
});
UserSchema.index( { "login": 1 }, { unique: true } );
UserSchema.index( { "alias": 1 }, { unique: true } );
export const UserModel = mongoose.model<IUser>('User', UserSchema);

/*
 * Confirmation
 */
export interface IConfirmation extends mongoose.Document {
  user : string | IUser;
  action : string;
  validUntil : number;
  key : string;
};
const ConfirmationSchema = new Schema({
  user : { type: Schema.Types.ObjectId, ref: 'User' },
  action : { type: String, required: true },
  validUntil : { type: Number, required: true },
  key : { type: String, required: true },
});
export const ConfirmationModel = mongoose.model<IConfirmation>('Confirmation', ConfirmationSchema);

/*
 * Skill
 */
export interface ISkill extends mongoose.Document {
  name : string;
  type : string;
  icon : string;
  custom? : boolean;
  createdTime : number;
};
const SkillSchema = new Schema({
  name : { type: String, required: true },
  type : { type: String, required: true },
  icon : { type: String },
  priority : { type: Number },
  scrappedUrl : { type: String },
  custom : { type: Boolean },
  createdTime : { type: Number },
  creator : { type: Schema.Types.ObjectId, ref: 'User', required: true },
});
SkillSchema.index( { name: 1, type: 1 }, { unique: true } );
SkillSchema.index({ name: 'text' });
export const SkillModel = mongoose.model<ISkill>('Skill', SkillSchema);

/*
 * UserSkill
 */
interface IAssignedSkill {
  skill : string | ISkill;
  strength : number;
  sortOrder? : number;
  modifiedTime : number;
};
export interface IUserSkill extends mongoose.Document, IAssignedSkill {
  user : string | IUser;
};
const UserSkillSchema = new Schema({
  user : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  skill : { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  strength : { type: Number },
  sortOrder : { type: Number },
  modifiedTime : { type: Number },
});
export const UserSkillModel = mongoose.model<IUserSkill>('UserSkill', UserSkillSchema);

/*
 * UserSkillHistory
 */
export interface IUserSkill extends mongoose.Document, IAssignedSkill {
  user : string | IUser;
};
const UserSkillHistorySchema = new Schema({
  user : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  skill : { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  strength : { type: Number },
  modifiedTime : { type: Number },
});
export const UserSkillHistoryModel = mongoose.model<IUserSkill>('UserSkillHistory', UserSkillHistorySchema);

/*
 * UserAvailability
 */
export interface IUserAvailability extends mongoose.Document {
  user : string | IUser;
  startTime: number;
  endTime: number;
  daysOfWeek?: number[];
  percentAway?: number;
  type : string;
};
const UserAvailabilitySchema = new Schema({
  user : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime : { type: Number, required: true },
  endTime : { type: Number, required: true },
  daysOfWeek : { type: [Number] },
  percentAway : { type: Number },
  type : { type: String, required: true },
});
export const UserAvailabilityModel = mongoose.model<IUserAvailability>('UserAvailability', UserAvailabilitySchema);

/*
 * PersonalNote
 */
export interface IPersonalNote extends mongoose.Document {
  user : string | IUser;
  createdTime: number;
  msdg : string;
};
const PersonalNoteSchema = new Schema({
  user : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdTime : { type: Number, required: true },
  msg : { type: String, required: true },
});
export const PersonalNoteModel = mongoose.model<IUserAvailability>('PersonalNote', PersonalNoteSchema);

/*
 * Team
 */
export interface ITeam extends mongoose.Document {
  name: string;
  alias: string;
  avatar?: string;
  about: string;
  website? : string;
  users?: (string | IUserTeam)[];
  projects?: (string | ITeamProject)[];
  invites?: ITeamInvite[];
  myRole?: string;
  locations?: string[];
  skillAreas?: string[];
  skillTypes?: ITeamSkillType[];
  plan?: string;
};
const TeamSchema = new Schema({
  name : { type: String, required: true },
  alias : { type: String, required: true },
  avatar : { type: String },
  about : { type: String },
  website : { type: String },
  locations: { type: [String] },
  skillAreas: { type: [String], default: Object.keys(skillAreas).map((key) => (skillAreas as any)[key].label) },
  plan: { type: String, default: 'starter' },
});
export const TeamModel = mongoose.model<ITeam>('Team', TeamSchema);

/*
 * UserTeam
 */
export interface IUserTeam extends mongoose.Document {
  user : string | IUser;
  team : string | ITeam;
  role : string;
  external? : boolean;
};
const UserTeamSchema = new Schema({
  user : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team : { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  role : { type: String, required: true },
  external : { type: Boolean },
  location: { type: String },
  skillArea: { type: String },
  directManager: { type: [Schema.Types.ObjectId], ref: 'User' },
});
UserTeamSchema.index( { user: 1, team: 1 }, { unique: true } );
export const UserTeamModel = mongoose.model<IUserTeam>('UserTeam', UserTeamSchema);

/*
 * TeamInvite
 */
export interface ITeamInvite extends mongoose.Document {
  user? : string | IUser;
  email? : string;
  team : string | ITeam;
  key : string;
  userLimit: number;
};
const TeamInviteSchema = new Schema({
  user : { type: Schema.Types.ObjectId, ref: 'User' },
  email : { type: String },
  team : { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  key : { type: String, required: true },
  userLimit : { type: Number, required: true },
});
export const TeamInviteModel = mongoose.model<ITeamInvite>('TeamInvite', TeamInviteSchema);

/*
 * Project
 */
export interface IProject extends mongoose.Document {
  accessKey : string;
  name: string;
  draft: boolean;
  startTime: number;
  endTime: number;
  about: string;
  tags: string[];
  references: string[];
  creator?: IUser;
  users: (string | IUserProject)[];
  myRole?: string;
  team?: ITeam;
  skills?: IAssignedSkill[];
};
const ProjectSchema = new Schema({
  accessKey : { type: String },
  name : { type: String, default: '' },
  draft : { type: Boolean, default: true },
  startTime : { type: Number },
  endTime : { type: Number },
  about : { type: String },
  tags : { type: [String] },
  references : { type: [String] },
  skills : [{
    skill: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    strength: { type: Number },
  }]
});
export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);

/*
 * TeamProject
 */
export interface ITeamProject extends mongoose.Document {
  team : string | ITeam;
  project : string | IProject;
};
const TeamProjectSchema = new Schema({
  team : { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  project : { type: Schema.Types.ObjectId, ref: 'Project', required: true },
});
export const TeamProjectModel = mongoose.model<ITeamProject>('TeamProject', TeamProjectSchema);

/*
 * UserProject
 */
export interface IUserProject extends mongoose.Document {
  user : string | IUser;
  project : string | IProject;
  role : string;
};
const UserProjectSchema = new Schema({
  user : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project : { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  role : { type: String, required: true },
});
UserProjectSchema.index( { user: 1, project: 1, role: 1 }, { unique: true } );
export const UserProjectModel = mongoose.model<IUserProject>('UserProject', UserProjectSchema);

/*
 * TeamSkillType
 */
export interface ITeamSkillType extends mongoose.Document {
  name: string;
  visualization: string;
  team: ITeam;
};

const TeamSkillTypeSchema = new Schema({
  name: { type: String, required: true },
  visualization: { type: String, required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true }
}, { timestamps: true });

export const TeamSkillTypeModel = mongoose.model<ITeamSkillType>('TeamSkillType', TeamSkillTypeSchema);

mongoose.connect(MongoUri, {
  useNewUrlParser: true,
  autoIndex: dev,
  useUnifiedTopology: true,
  keepAlive: true,
});
