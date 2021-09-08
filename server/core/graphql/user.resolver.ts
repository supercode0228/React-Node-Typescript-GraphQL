import { GraphQLResolveInfo } from 'graphql';
import {
  ObjectType,
  Field,
  ID,
  Resolver,
  Query,
  Arg,
  Ctx,
  Info,
  ArgsType,
  Args,
  InputType,
  Mutation,
  Authorized,
  Float,
  Int,
} from 'type-graphql';
import {
  Length,
  Matches,
  ArrayMaxSize,
  IsEmail,
} from 'class-validator';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import axios from 'axios';

import { UserModel, IUser, SkillModel, UserSkillModel, UserTeamModel, ConfirmationModel, UserAvailabilityModel, PersonalNoteModel, IUserJobExperience, UserProjectModel, IProject, TeamProjectModel, IUserProject, ITeam } from '../db';
import { UserSkill } from '../../../shared/types';
import skillAreas from '../../../shared/data/skillAreas.json';
import { IQueryContext, getResolveFields } from './shared';
import { assignFieldsIfNotNull } from '../../../shared/util/object';
import { Team, UserTeam } from './team.resolver';
import { AliasPattern, PasswordPattern } from '../../../shared/config';
import { sendEmail, sendEmailTemplate } from '../email';
import { RootUri, SuggestBlogsUrl, BlogBaseUrl } from '../../config';
import { randomStr } from '../../../shared/util/str';
import { daysInMonth } from '../../../shared/util/time';
import { sendActivationEmail } from '../../handlers/auth';
import { UserProject } from './project.resolver';
import { syncActiveCampaignContactQueue } from '../../queues';

@ObjectType()
export class User {
  @Field(type => ID)
  id: string = '';

  @Field({ nullable: true })
  name: string = '';

  @Field({ nullable: true })
  login: string = '';

  @Field({ nullable: true })
  authProvider: string = '';

  @Field({ nullable: true })
  emailVerified?: boolean;

  @Field({ nullable: true })
  alias: string = '';

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  me?: boolean;

  @Field({ nullable: true })
  skillArea: string = '';

  @Field({ nullable: true })
  publicProfile: boolean = false;

  @Field({ nullable: true })
  about?: string;

  @Field({ nullable: true })
  jobTitle?: string;

  @Field({ nullable: true })
  location?: string;

  @Field(type => [String], { nullable: true })
  links?: string[];

  @Field(type => [String], { nullable: true })
  references?: string[];

  @Field({ nullable: true })
  activeTeam?: string;

  @Field(type => [UserTeam], { nullable: true })
  teams?: UserTeam[];

  @Field(type => [UserProject], { nullable: true })
  projects?: UserProject[];

  @Field({ nullable: true })
  pinnedSkillType?: string;

  @Field(type => [UserJobExperience], { nullable: true })
  jobExperience?: UserJobExperience[];

  @Field()
  projectUtilizationViewMonths: number = 12;
};

@ObjectType()
export class UserJobExperience {
  @Field(type => String, { nullable: true })
  team?: Team;

  @Field(type => String, { nullable: true })
  customName?: string;

  @Field(type => Float, { nullable: true })
  startTime?: number;

  @Field(type => Float, { nullable: true })
  endTime?: number;
}

@ArgsType()
class UserArgs {
  @Field(type => String, { nullable: true })
  id?: string;

  @Field(type => String, { nullable: true })
  @Matches(AliasPattern)
  alias?: string;
};

@ArgsType()
class UserCredentialsArgs {
  @Field(type => String, { nullable: true })
  @IsEmail()
  login?: string;

  @Field(type => String, { nullable: true })
  @Matches(AliasPattern)
  alias?: string;
};

@ArgsType()
class AddPersonalNoteArgs {
  @Field(type => String)
  @Length(1, 240)
  msg: string = '';
};
@ArgsType()
class RemovePersonalNoteArgs {
  @Field(type => ID)
  id: string = '';
};

@ArgsType()
class ChangePasswordArgs {
  @Field(type => String)
  oldPassword: string = '';

  @Field(type => String)
  @Matches(PasswordPattern)
  newPassword: string = '';
};

@ArgsType()
class RequestResetPasswordArgs {
  @Field(type => String)
  email: string = '';
};

@ObjectType()
export class BlogEntryThumbnail {
  @Field({ nullable: true })
  url? : string;
};
@ObjectType()
export class BlogEntry {
  @Field()
  name : string = '';

  @Field()
  summary : string = '';

  @Field()
  url : string = '';

  @Field()
  slug : string = '';

  @Field(type => BlogEntryThumbnail, { nullable: true })
  thumbnail? : BlogEntryThumbnail;

  @Field({ nullable: true })
  bgColor? : string;
};

@InputType()
class UserInput {
  // @Field(type => ID)
  // id: string = '';

  @Field({ nullable: true })
  @Length(1, 255)
  name?: string;

  @Field({ nullable: true })
  @Matches(AliasPattern)
  alias?: string;

  @Field({ nullable: true })
  @Length(0, 255)
  skillArea?: string;

  @Field({ nullable: true })
  joinedMailingList?: boolean;

  @Field({ nullable: true })
  publicProfile?: boolean;

  @Field({ nullable: true })
  @Length(0, 4096)
  about?: string;

  @Field({ nullable: true })
  @Length(0, 255)
  jobTitle?: string;

  @Field({ nullable: true })
  @Length(0, 255)
  location?: string;

  @Field(type => [String], { nullable: true })
  @ArrayMaxSize(20)
  links?: string[];

  @Field(type => [String], { nullable: true })
  @ArrayMaxSize(20)
  references?: string[];

  @Field({ nullable: true })
  @Length(1, 255)
  activeTeam?: string;

  @Field({ nullable: true })
  @Length(1, 255)
  pinnedSkillType?: string;

  @Field(type => [UserJobExperienceInput], { nullable: true })
  @ArrayMaxSize(20)
  jobExperience?: UserJobExperienceInput[];

  @Field({ nullable: true })
  projectUtilizationViewMonths?: number;
};

@InputType()
export class UserJobExperienceInput {
  @Field(type => String, { nullable: true })
  team?: Team;

  @Field(type => String, { nullable: true })
  customName?: string;

  @Field(type => Float, { nullable: true })
  startTime?: number;

  @Field(type => Float, { nullable: true })
  endTime?: number;
}

@ObjectType()
export class UserAvailability {
  @Field(type => ID)
  id: string = '';

  @Field(type => Float)
  startTime: number = 0;

  @Field(type => Float)
  endTime: number = 0;

  @Field(type => [Int], { nullable: true })
  daysOfWeek?: number[];

  @Field(type => Float)
  percentAway?: number = 0.0;

  @Field(type => String)
  type: string = '';
}

@ObjectType()
export class PersonalNote {
  @Field(type => ID)
  id: string = '';

  @Field(type => String)
  msg: string = '';

  @Field(type => Float)
  createdTime: number = 0;
}

@InputType()
export class UserAvailabilityInput {
  // @Field(type => ID, { nullable: true })
  // id?: string;

  @Field(type => Float)
  startTime: number = 0;

  @Field(type => Float)
  endTime: number = 0;

  @Field(type => [Int], { nullable: true })
  daysOfWeek?: number[];

  @Field(type => Float)
  percentAway?: number = 0.0;

  @Field(type => String)
  type: string = '';
}

@ArgsType()
class UpdateUserAvailabilityArgs {
  @Field(type => [UserAvailabilityInput])
  @ArrayMaxSize(40)
  availability: UserAvailabilityInput[] = [];
}

@InputType()
class UserTeamInput {
  @Field(() => ID)
  teamId?: string;

  @Field({ nullable: true })
  skillArea?: string;

  @Field({ nullable: true })
  location?: string;

  @Field(type => [ID], { nullable: true })
  directManager?: string[];
};

@ObjectType()
export class UserAvailabilitySummary {
  @Field(type => [Float], { description: 'Percent of the business time user is available each month' })
  monthSummaries: number[] = [];

  @Field(type => Int)
  vacationDaysSet: number = 0;

  @Field(type => Float)
  projectUtilization: number = 0;
}

@ArgsType()
class UserAvailabilityArgs {
  @Field(type => Float, { nullable: true })
  startTime?: number;

  @Field(type => Float, { nullable: true })
  endTime?: number;
};

@ArgsType()
class UserAvailabilitySummaryArgs {
  @Field(type => Int)
  year: number = 0;
};


const cachedBlogs : { blogs: BlogEntry[], updatedTime : number } = {
  blogs : [],
  updatedTime: 0,
};
const updateBlogsInterval = 60000;
const getOrLoadSuggestedBlogs = async (user : IUser) => {
  if(cachedBlogs.updatedTime + updateBlogsInterval <= Date.now()) {
    const res = await axios.get(SuggestBlogsUrl);
    cachedBlogs.blogs = (res.data.items as BlogEntry[]).slice(0, 1).map(b => ({ ...b, url: `${BlogBaseUrl}${b.slug}`, bgColor: (b as any)['bg-colour'] }));
    cachedBlogs.updatedTime = Date.now();
  }
  return cachedBlogs.blogs;
};

@Resolver(User)
class UserResolver {
  @Query(returns => Boolean)
  async checkCredentialsAvailable(
    @Args() { login, alias } : UserCredentialsArgs,
    @Ctx("user") userCtx?: IUser
  ) {
    if(!login && !alias)
      return false;
    return await checkCredentialsAvailable(userCtx?._id.toString() || '', login, alias);
  }

  @Query(returns => User, { nullable: true })
  async user(
    @Args() { id, alias } : UserArgs,
    @Info() resolveInfo: GraphQLResolveInfo,
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = id ?? userCtx?._id;
    if(!_userId && !alias)
      return null;
    let query = {};
    if(alias)
      query = { ...query, alias };
    else if(_userId)
      query = { ...query, _id: _userId };
    const user = await UserModel.findOne(query);
    if(!user)
      return new Error('Cannot find the user record');

    const me = user?._id.toString() === userCtx?._id.toString();

    // Only the owner of the private profile can view it
    if(!user?.publicProfile && !me) {
      if(!userCtx?._id)
        return null;
      // Check whether the requesting user has at least one team in common with the target one
      const requesterTeams = (await UserTeamModel.find({ user: userCtx?._id })).map(t => t.team.toString());
      const userTeams = (await UserTeamModel.find({ user })).map(t => t.team.toString());
      if(!requesterTeams.some(rt => userTeams.includes(rt)))
        return null;
    }

    if(!me) {
      user.login = '';
      user.authProvider = '';
    }

    const resolveFields = getResolveFields(resolveInfo);

    if('teams' in resolveFields.User) {
      // Resolve the user's teams
      user.teams = (await UserTeamModel.find({ user: user._id }).populate({
        path: 'team',
      }));
    }
    if('projects' in resolveFields.User) {
      // Resolve the user's projects
      const userProjects = (await UserProjectModel.aggregate(
        [
          { $match: { user : user._id } },
          { $group: {
              _id: '$project',
              user: { $first: '$user' },
              project: { $first: '$project' },
              role: { $first: '$role' },
            }
          },
          { $lookup: {
              from: 'projects',
              localField: 'project',
              foreignField:'_id',
              as: 'project'
            }
          },
          { $unwind: '$project' },
        ]
      ));
      user.projects = userProjects.map(up => ({
        ...up,
        project: {
          ...up.project,
          id: up.project._id,
        },
        id: up._id,
      }));
      if(user.projects.length > 0) {
        const projectTeams = (await TeamProjectModel.find({ project: { $in: user.projects.map(p => ((p as IUserProject).project as IProject).id) } }).populate({
          path: 'team',
        }));
        user.projects.forEach(p =>
          ((p as IUserProject).project as IProject).team = projectTeams.find(pt => pt.project.toString() === ((p as IUserProject).project as IProject).id.toString())?.team as ITeam
        );
      }
    }

    user.me = me;
    return user;
  }

  @Query(returns => [UserAvailability])
  async userAvailability(
    @Args() { startTime, endTime } : UserAvailabilityArgs,
    @Info() resolveInfo: GraphQLResolveInfo,
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;
    const user = await UserModel.findOne({ _id: _userId });
    if(!user)
      return new Error('Cannot find the user record');

    const availability = await UserAvailabilityModel.find({
      user: _userId,
      endTime: { $gte: Date.now() },
      // endTime: { $gte: startTime },
      // startTime: { $lt: endTime },
    });

    return availability;
  }

  @Query(returns => [BlogEntry])
  async suggestedBlogs(
    @Info() resolveInfo: GraphQLResolveInfo,
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;
    const user = await UserModel.findOne({ _id: _userId });
    if(!user)
      return new Error('Cannot find the user record');

    const blogs = await getOrLoadSuggestedBlogs(user);

    return blogs;
  }

  @Query(returns => UserAvailabilitySummary)
  async userAvailabilitySummary(
    @Args() { year } : UserAvailabilitySummaryArgs,
    @Info() resolveInfo: GraphQLResolveInfo,
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;
    const user = await UserModel.findOne({ _id: _userId });
    if(!user)
      return new Error('Cannot find the user record');

    // const year = new Date().getFullYear();
    const yearStart = new Date(year, 0).getTime();
    const yearEnd = new Date(year+1, 0).getTime();
    const availability = await UserAvailabilityModel.find({
      user: _userId,
      endTime: { $gte: yearStart },
      startTime: { $lt: yearEnd },
    });

    const months : number[][] = _.range(0, 12).map(m =>
      _.range(0, daysInMonth(m, year)).map((d, j) => {
        const tDate = new Date(year, m, j+1);
        // Sundays and Saturdays
        if(tDate.getUTCDay() === 0 || tDate.getUTCDay() === 6)
          return 0.0;
        return 1.0
      })
    );
    let vacationDaysSet = 0;
    availability.forEach(a => {
      let start = new Date(Math.max(a.startTime, yearStart)).getTime();
      const end = new Date(Math.min(a.endTime, yearEnd)).getTime();
      // let month = start.getUTCMonth();
      // let day = start.getUTCDate();
      while(
        start < end
        // (day < end.getUTCDate() || month < end.getUTCMonth() || start.getUTCFullYear() < end.getUTCFullYear())
        // && month < 12
      ) {
        const current = new Date(start);
        let month = current.getUTCMonth();
        let day = current.getUTCDate();
        let dayOfWeek = current.getUTCDay();
        if(
          (a.type === 'planned' && a.daysOfWeek?.includes(dayOfWeek))
          || (a.type === 'vacation')
        ) {
          if(months[month][day-1] > 0 && a.type === 'vacation') {
            vacationDaysSet++;
          }
          months[month][day-1] = Math.max((months[month][day-1] || 0) - (a.percentAway || 1.0), 0.0);
        }

        start += 86400000;
        // day++;
        // if(day > daysInMonth(month, year)) {
        //   day = 1;
        //   month++;
        // }
      }
    });
    const monthSummaries = months.map((m, i) => {
      let availaibilitySum = 0.0;
      let nDays = 0;
      m.forEach((d, j) => {
        const tDate = new Date(year, i, j+1);
        if(tDate.getUTCDay() > 0 && tDate.getUTCDay() < 6) {
          // Is a business day
          availaibilitySum += d;
          nDays++;
        }
      });

      return availaibilitySum / Math.max(nDays, 1.0);
    });

    const monthMillis = 365 * 86400000 / 12;
    const projectUtilizationHorizon = Date.now() + (user.projectUtilizationViewMonths || 12) * monthMillis;
    const projects = (await UserProjectModel.find({ user }).populate('project'))
      .map(p => p.project as IProject).filter(p => !p.draft && p.startTime && p.endTime);
    const projectUtilizationDays = _.range(Date.now(), projectUtilizationHorizon, 86400000)
      .map((t, i) => (projects.some(p => t >= p.startTime && t <= p.endTime) ? 1.0 : 0.0) as number);
    const projectUtilization = projectUtilizationDays.reduce((a, b) => a + b, 0) / projectUtilizationDays.length;

    const summary = {
      monthSummaries,
      vacationDaysSet,
      projectUtilization,
    };

    return summary;
  }

  @Query(returns => [PersonalNote])
  async personalNotes(
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;
    const user = await UserModel.findOne({ _id: _userId });
    if(!user)
      return new Error('Cannot find the user record');

    const notes = await PersonalNoteModel.find({
      user: _userId,
    }).sort({ createdTime: -1 });

    return notes;
  }

  @Mutation(returns => User)
  @Authorized()
  async updateUserData(
    @Arg('data') {
      name,
      alias,
      skillArea,
      joinedMailingList,
      publicProfile,
      about,
      jobTitle,
      location,
      links,
      references,
      activeTeam,
      pinnedSkillType,
      jobExperience,
      projectUtilizationViewMonths,
    } : UserInput,
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;
    const user = await UserModel.findOne({ _id: _userId });
    if(!user)
      return new Error('Cannot find the user record');
    // Trying to edit someone else's info?
    if(user._id.toString() !== userCtx?._id.toString())
      return new Error('Access denied');

    if(alias) {
      // Check whether requested alias is available
      // TODO: check alias format validity
      const credentialsAvailable = await checkCredentialsAvailable(
        userCtx?._id.toString() || '',
        undefined,
        alias
      );
      if(!credentialsAvailable)
        return new Error('Requested credentials are not available');
    }

    // Validate given fields
    if(skillArea && !Object.keys(skillAreas).includes(skillArea))
      return new Error('Invalid "skillArea" provided');

    // Update the given fields
    assignFieldsIfNotNull(user, {
      name,
      alias,
      skillArea,
      joinedMailingList,
      publicProfile: publicProfile && user.emailVerified,
      about,
      jobTitle,
      location,
      links,
      references,
      activeTeam,  // TODO: check if team assignment is valid
      pinnedSkillType,
      jobExperience,
      projectUtilizationViewMonths,
    });

    await user.save();

    syncActiveCampaignContactQueue.add({ user: user });

    return user;
  }

  @Mutation(
    returns => [UserAvailability],
    { description: "Replace the user's future availabity records with the new ones" }
  )
  @Authorized()
  async updateUserAvailability(
    @Args() { availability } : UpdateUserAvailabilityArgs,
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    await UserAvailabilityModel.deleteMany({
      user: _userId,
      endTime: { $gte: Date.now() },
      // endTime: { $gte: startTime },
    });

    const newAvailability = await UserAvailabilityModel.insertMany(
      availability.map(a => ({ ...a, user: _userId }))
    );

    return newAvailability;
  }

  @Mutation(() => Boolean)
  @Authorized()
  async updateUserTeam(
    @Arg('input') {
      teamId,
      skillArea,
      location,
      directManager
    }: UserTeamInput,
    @Ctx('user') userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    const userTeam = await UserTeamModel.findOne({ user: _userId, team: teamId });
    if(!userTeam) {
      return new Error("You're not a member of this team");
    }

    // Update the given fields
    assignFieldsIfNotNull(userTeam, {
      skillArea,
      location,
      directManager
    });

    await userTeam.save();
    return true;
  }

  @Mutation(returns => Boolean)
  @Authorized()
  async addPersonalNote(
    @Args() {
      msg,
    } : AddPersonalNoteArgs,
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;
    const user = await UserModel.findOne({ _id: _userId });
    if(!user)
      return new Error('Cannot find the user record');

    const newNote = new PersonalNoteModel({
      user,
      createdTime: Date.now(),
      msg,
    });
    await newNote.save();

    return true;
  }

  @Mutation(returns => Boolean)
  @Authorized()
  async removePersonalNote(
    @Args() {
      id,
    } : RemovePersonalNoteArgs,
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;
    const user = await UserModel.findOne({ _id: _userId });
    if(!user)
      return new Error('Cannot find the user record');

    await PersonalNoteModel.remove({ _id: id, user });

    return true;
  }

  @Mutation(returns => Boolean)
  @Authorized()
  async changePassword(
    @Args() {
      oldPassword,
      newPassword,
    } : ChangePasswordArgs,
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;
    const user = await UserModel.findOne({ _id: _userId });
    if(!user)
      return new Error('Cannot find the user record');
    // Trying to edit someone else's info?
    if(user._id.toString() !== userCtx?._id.toString())
      return new Error('Access denied');

    if(!await bcrypt.compare(oldPassword, user.pass))
      return new Error("OLD_PASSWORD_DOESNT_MATCH");

    const encryptedNewPass = await bcrypt.hash(newPassword, 8);
    user.pass = encryptedNewPass;

    const sendRes = await sendEmailTemplate(
      user.login,
      `Your Tests password has been changed`,
      'passwordChanged',
      { name: user.name }
    );

    await user.save();
    return true;
  }

  @Mutation(returns => Boolean)
  @Authorized()
  async deleteAccount(
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;
    const user = await UserModel.findOne({ _id: _userId });
    if(!user)
      return new Error('Cannot find the user record');

    const confirmation = new ConfirmationModel({
      user,
      action: 'account/delete',
      key: randomStr(32),
      validUntil: Date.now() + 86000000,
    });
    await confirmation.save();

    const confirmLink = `${RootUri}/confirm/${confirmation.key}`;
    const dashboardLink = `${RootUri}/dashboard`;

    const sendRes = await sendEmailTemplate(
      user.login,
      `Tests Account Deletion`,
      'accountDeletion',
      { confirmLink, dashboardLink }
    );

    return true;
  }

  @Mutation(returns => Boolean)
  async requestResetPassword(
    @Args() {
      email,
    } : RequestResetPasswordArgs,
  ) {
    const user = await UserModel.findOne({ login: email });
    if(!user)
      return new Error('Cannot find the user record');

    const confirmation = new ConfirmationModel({
      user,
      action: 'account/resetPassword',
      key: randomStr(32),
      validUntil: Date.now() + 86000000,
    });
    await confirmation.save();

    const confirmLink = `${RootUri}/confirm/${confirmation.key}`;
    const dashboardLink = `${RootUri}/dashboard`;

    const sendRes = await sendEmailTemplate(
      user.login,
      `Reset your password`,
      'resetPassword',
      { confirmLink, dashboardLink }
    );

    return true;
  }

  @Mutation(returns => Boolean)
  async requestAccountActivation(
    @Ctx("user") userCtx?: IUser
  ) {
    const _userId = userCtx?._id;
    const user = await UserModel.findOne({ _id: _userId });
    if(!user)
      return new Error('Cannot find the user record');

    await sendActivationEmail(user);

    return true;
  }
};

const checkCredentialsAvailable = async (userId : string, login? : string, alias? : string) => {
  let query : { $or : any[] } = {$or: []};
  if(alias)
    query.$or.push({ alias });
  if(login)
    query.$or.push({ login });
  const user = await UserModel.findOne(query);
  if(user == null)
    return true;
  return user._id.toString() === userId;
};

export default UserResolver;
