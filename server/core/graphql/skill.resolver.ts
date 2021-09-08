/**
 * @format
 */

import { Length, ArrayMaxSize } from 'class-validator';
import escapeStringRegexp from 'escape-string-regexp';
import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  ID,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from 'type-graphql';
import { isPro } from '../../../shared/util/plan';
import {
  ISkill,
  IUser,
  ProjectModel,
  SkillModel,
  TeamModel,
  TeamSkillTypeModel,
  UserAvailabilityModel,
  UserProjectModel,
  UserSkillHistoryModel,
  UserSkillModel,
  UserTeamModel
} from '../db';
import { User } from './user.resolver';

@ObjectType()
export class Skill {
  @Field(() => ID)
  id: string = '';

  @Field()
  name: string = '';

  @Field()
  type: string = '';

  @Field({ nullable: true })
  icon: string = '';

  @Field({ nullable: true })
  custom: boolean = false;
}

@ObjectType()
export class AssignedSkill {
  @Field()
  skill: Skill = new Skill();

  @Field()
  strength: number = 0.0;

  @Field()
  sortOrder?: number = 0.0;

  @Field({ nullable: true })
  modifiedTime: number = 0.0;
}

@ObjectType()
export class UserSkill extends AssignedSkill {
  @Field()
  user: string = '';
}

@ObjectType()
export class AggregatedSkill extends AssignedSkill {
  @Field()
  userCount: number = 0;

  @Field((type) => [Number], { nullable: true })
  strengths: number[] = [];

  @Field({ nullable: true })
  unavailableCount?: number;
}

@ObjectType()
export class TeamSkills {
  @Field(() => [AggregatedSkill])
  skills: AggregatedSkill[] = [];

  @Field()
  userCount: number = 0;
}

@ObjectType()
export class UserSkillWithUserInfo extends AssignedSkill {
  @Field()
  user: User = new User();
}

@InputType()
class SkillInput {
  @Field(() => String)
  @Length(1, 255)
  name: string = '';

  @Field(() => String)
  type: string = '';
}

@InputType()
class TeamSkillsInput {
  @Field(() => [String])
  skills: string[] = [];

  @Field(() => String)
  type: string = '';
}

@InputType()
export class AssignedSkillInput {
  @Field()
  skill: string = '';

  @Field()
  strength: number = 0.0;

  @Field()
  sortOrder: number = 0.0;
}

@ArgsType()
class SkillArgs {
  @Field(() => String, { nullable: true })
  @Length(1, 255)
  type?: string;

  @Field(() => String, { nullable: true })
  @Length(0, 255)
  name?: string;

  @Field(() => [String], { nullable: true })
  @ArrayMaxSize(20)
  exclude?: string;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Boolean, { nullable: true })
  exact?: boolean;

  @Field(() => [String], { nullable: true })
  onlyTypes?: string;
}

@ArgsType()
class UserSkillArgs {
  @Field(() => String, { nullable: true })
  @Length(1, 255)
  type?: string;

  @Field(() => String, { nullable: true })
  userId?: string;
}

@ArgsType()
class TeamSkillsArgs {
  @Field(() => String)
  @Length(1, 255)
  type: string = '';

  @Field(() => ID)
  team: string = '';

  @Field(() => String, { nullable: true })
  skillArea?: string;

  @Field(() => String, { nullable: true })
  textFilter?: string;

  @Field(() => String, { nullable: true })
  showing?: string;
}

@ArgsType()
class TeamSkillArgs {
  @Field(() => String)
  skill: string = '';

  @Field(() => ID)
  team: string = '';
}

@ArgsType()
class ProjectSkillsArgs {
  @Field(() => String)
  @Length(1, 255)
  type: string = '';

  @Field(() => ID)
  project: string = '';

  @Field(() => String, { nullable: true })
  accessKey?: string;
}

@ArgsType()
class UserSkillsArgs {
  @Field(() => String)
  @Length(1, 255)
  type: string = '';

  @Field(() => [AssignedSkillInput])
  skills: AssignedSkillInput[] = [];
}

@ArgsType()
class CreateTeamSkillsArgs {
  @Field(() => ID)
  teamId: string = '';

  @Field(() => TeamSkillsInput)
  input: TeamSkillsInput = new TeamSkillsInput();
}

@ArgsType()
class DeleteTeamSkillsArgs {
  @Field(() => ID)
  teamId: string = '';

  @Field(() => [ID])
  ids: string[] = [];
}

@Resolver(Skill)
class SkillResolver {
  @Query(() => [Skill], {
    description: 'Returns skills in the public database'
  })
  skills(@Args() { name, type, exclude, limit, exact, onlyTypes }: SkillArgs) {
    let query = {};

    if (name) {
      query = {
        ...query,
        name: {
          $regex: exact
            ? `^${escapeStringRegexp(name)}$`
            : `^(${escapeStringRegexp(name)}|.* ${escapeStringRegexp(name)}).*`,
          $options: 'i'
        }
      };
    }

    if (type) {
      query = { ...query, type };
    }

    if (exclude) {
      query = { ...query, _id: { $nin: exclude } };
    }

    if (onlyTypes) {
      query = { ...query, type: { $in: onlyTypes } };
    }

    return SkillModel.find(query)
      .sort({ priority: -1 })
      .limit(limit || 0);
  }

  @Query(() => [UserSkill], {
    description: 'Returns skills for a specific user'
  })
  async userSkills(
    @Args() { userId, type }: UserSkillArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = userId ?? currentUser?._id;

    if (!_userId) {
      return new Error('Not authenticated');
    }

    return (
      await UserSkillModel.find({
        user: _userId
      })
        .sort({ sortOrder: -1 })
        .populate({
          path: 'skill',
          match: { type }
        })
    ).filter((userSkill) => userSkill.skill);
  }

  @Query(() => TeamSkills, {
    description:
      'Returns the unique skills of the team members, with the `strength` summed up'
  })
  @Authorized()
  async teamSkills(
    @Args()
    { team, type, skillArea, textFilter, showing = 'top' }: TeamSkillsArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    const teamObj = await TeamModel.findOne({ _id: team });
    if (!teamObj) {
      return new Error('Team not found');
    }

    const userTeam = await UserTeamModel.findOne({
      user: _userId,
      team: teamObj._id
    });
    if (!userTeam) {
      return new Error("You're not a member of this team");
    }

    if (showing === 'all' && !isPro(teamObj.plan)) {
      return new Error('Upgrade your plan to view all skills');
    }

    let query = {};
    query = { team: teamObj.id };

    if (skillArea) {
      query = { ...query, skillArea };
    }

    const members = (await UserTeamModel.find(query)).filter(
      (userTeam) => userTeam.user
    );

    const currentTime = Date.now();
    const dayOfWeek = new Date().getUTCDay();

    let unavailableMembers = new Set(
      (
        await UserProjectModel.find({
          user: { $in: members.map((m) => m.user) },
          role: 'member'
        }).populate({
          path: 'project',
          match: {
            startTime: { $lt: currentTime },
            endTime: { $gt: currentTime },
            draft: false
          }
        })
      )
        .filter((u) => u.project)
        .map((u) => u.user.toString())
    );

    unavailableMembers = new Set([
      ...unavailableMembers,
      ...(
        await UserAvailabilityModel.find({
          user: { $in: members.map((m) => m.user) },
          endTime: { $gte: Date.now() },
          startTime: { $lt: Date.now() },
          $or: [
            { type: 'vacation' },
            { type: 'planned', daysOfWeek: { $in: [dayOfWeek] } }
          ]
        })
      ).map((u) => u.user.toString())
    ]);

    let skillQuery = {};
    skillQuery = {
      $expr: { $and: [{ $eq: ['$_id', '$$skill'] }, { $eq: ['$type', type] }] }
    };

    if (textFilter && textFilter !== '') {
      skillQuery = {
        ...skillQuery,
        name: {
          $regex: `^(${escapeStringRegexp(textFilter)}|.* ${escapeStringRegexp(
            textFilter
          )}).*`,
          $options: 'i'
        }
      };
    }

    let sortField = 'strength';
    if (showing === 'newest') {
      sortField = 'modifiedTime';
    }

    const aggregations: any = [
      { $match: { user: { $in: members.map((u) => (u.user as IUser)._id) } } },
      {
        $group: {
          _id: '$skill',
          skill: { $first: '$skill' },
          strength: { $sum: '$strength' },
          userCount: { $sum: 1 },
          modifiedTime: { $first: '$modifiedTime' },
          users: { $push: '$user' }
        }
      },
      {
        $lookup: {
          from: 'skills',
          let: { skill: '$skill' },
          pipeline: [{ $match: skillQuery }],
          as: 'skill'
        }
      },
      { $match: { skill: { $size: 1 } } },
      { $sort: { [sortField]: -1 } }
    ];

    if (showing !== 'all') {
      aggregations.push({ $limit: 10 });
    }

    let skills = await UserSkillModel.aggregate(aggregations);

    skills = skills.map((s) => ({
      ...s,
      skill: {
        ...s.skill[0],
        id: s.skill[0]._id
      },
      unavailableCount: s.users.reduce(
        (a: string, b: string) =>
          a + (unavailableMembers.has(b.toString()) ? 1 : 0),
        0
      ),
      users: undefined,
      id: s._id
    }));

    return {
      skills,
      userCount: members.length
    };
  }

  @Query(() => [UserSkillWithUserInfo], {
    description: 'Returns team member drill-down by a specific skill'
  })
  @Authorized()
  async teamSkill(
    @Args() { team, skill }: TeamSkillArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    const userTeams = await UserTeamModel.find({ team });

    let skills = await UserSkillModel.find({
      user: { $in: userTeams.map((u) => u.user) },
      skill
    })
      .populate('skill')
      .populate('user');

    skills.forEach(
      (s) =>
        ((s.user as IUser).me =
          (s.user as IUser).id.toString() === _userId.toString())
    );

    return skills;
  }

  @Query(() => TeamSkills, {
    description: 'Returns project skills'
  })
  async projectSkills(@Args() { project, type }: ProjectSkillsArgs) {
    const projectObj = await ProjectModel.findOne({ _id: project });
    if (!projectObj) {
      return new Error('Project not found');
    }

    // TODO: check user-team-project access
    // TODO: check the `accessKey`

    const projectUsers = (
      await UserProjectModel.find({ project: projectObj.id }).populate({
        path: 'user'
      })
    ).filter((projectUser) => projectUser.user);

    let skillQuery = {};
    skillQuery = {
      $expr: { $and: [{ $eq: ['$_id', '$$skill'] }, { $eq: ['$type', type] }] }
    };

    let allSkills = await UserSkillModel.find({
      user: {
        $in: projectUsers.map((projectUser) => (projectUser.user as IUser)._id)
      }
    });

    let skills = await UserSkillModel.aggregate([
      {
        $match: {
          user: {
            $in: projectUsers.map(
              (projectUser) => (projectUser.user as IUser)._id
            )
          }
        }
      },
      {
        $group: {
          _id: '$skill',
          skill: { $first: '$skill' },
          strength: { $max: '$strength' },
          userCount: { $sum: 1 },
          users: { $push: '$user' }
        }
      },
      { $sort: { strength: -1 } },
      {
        $lookup: {
          from: 'skills',
          let: { skill: '$skill' },
          pipeline: [{ $match: skillQuery }],
          as: 'skill'
        }
      },
      { $match: { skill: { $size: 1 } } },
      { $sort: { strength: -1 } },
      { $limit: 10 }
    ]);

    skills = skills.map((s) => {
      let strengths: number[] = [];
      allSkills.forEach((as) => {
        if (as.skill.toString() === s.skill[0]._id.toString())
          strengths.push(as.strength);
      });
      return {
        ...s,
        skill: {
          ...s.skill[0],
          id: s.skill[0]._id
        },
        strengths: strengths,
        users: undefined,
        id: s._id
      };
    });

    return {
      skills,
      userCount: projectUsers.length
    };
  }

  @Mutation(() => [UserSkill], {
    description: 'Creates or updates user skills and history'
  })
  async updateUserSkills(
    @Args() { type, skills }: UserSkillsArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;
    if (!_userId) {
      return new Error('Not authenticated');
    }

    const existingSkills = (
      await UserSkillModel.find({ user: _userId }).populate({
        path: 'skill',
        match: { type }
      })
    ).filter((us) => us.skill);

    const changedSkills = skills.filter((s) => {
      const skill = existingSkills.find(
        (es) => (es.skill as ISkill).id == s.skill
      );

      return !skill || skill.strength !== s.strength;
    });

    const removedSkills = existingSkills.filter(
      (es) => !skills.find((s) => s.skill == (es.skill as ISkill).id)
    );

    if (changedSkills.length > 0) {
      // Save all the changed skill in history
      // Skill changes younger than `ReplaceAge` are replaced by the newer ones
      const ReplaceAge = 86000000 * 0.5; // 12h
      await UserSkillHistoryModel.deleteMany({
        user: _userId,
        skill: { $in: changedSkills.map((s) => s.skill) },
        modifiedTime: { $gt: Date.now() - ReplaceAge }
      });

      await UserSkillHistoryModel.insertMany(
        changedSkills.map((s) => ({
          user: _userId,
          skill: s.skill,
          strength: s.strength,
          modifiedTime: Date.now()
        }))
      );
    }

    await UserSkillModel.deleteMany({
      _id: { $in: removedSkills.map((rs) => rs._id) }
    });

    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];

      await UserSkillModel.updateOne(
        { user: _userId, skill: skill.skill },
        {
          strength: skill.strength,
          sortOrder: skill.sortOrder,
          modifiedTime: Date.now()
        },
        { upsert: true }
      );
    }

    return (
      await UserSkillModel.find({ user: _userId }).populate({
        path: 'skill',
        match: { type }
      })
    ).filter((s) => s.skill);
  }

  @Mutation(() => Skill, {
    description: 'Creates a custom skill'
  })
  async addCustomSkill(
    @Arg('data') { name, type }: SkillInput,
    @Ctx('user') currentUser?: IUser
  ) {
    // TODO: throttle
    const _userId = currentUser?._id;
    if (!_userId) {
      return new Error('Not authenticated');
    }

    // Resolve slight mistypings into existing skills
    let normalizedName = name.trim();
    const existingSkill = await SkillModel.findOne({
      name: { $regex: `^${normalizedName}$`, $options: 'i' },
      type
    });
    if (existingSkill) {
      return existingSkill;
    }

    // Force the first letter to be uppercase
    normalizedName =
      normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);

    let newSkill = new SkillModel({
      name: normalizedName,
      type,
      custom: true,
      creator: _userId,
      createdTime: Date.now()
    });
    newSkill = await newSkill.save();

    return newSkill;
  }

  @Mutation(() => Boolean, {
    description: 'Creates team specific skills'
  })
  @Authorized()
  async createTeamSkills(
    @Args() { teamId, input: { skills, type } }: CreateTeamSkillsArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    const team = await TeamModel.findOne({ _id: teamId });
    if (!team) {
      return new Error('Team not found');
    }

    const userTeam = await UserTeamModel.findOne({
      user: _userId,
      team: team._id
    });
    if (!userTeam) {
      return new Error("You're not a member of this team");
    }

    if (!['owner', 'admin'].includes(userTeam.role)) {
      return new Error('Only team owners or admins can create team skills');
    }

    if (!isPro(team.plan)) {
      return new Error('Upgrade your plan');
    }

    for (let i = 0; i < skills.length; i++) {
      const name = skills[i].trim();

      const existingSkill = await SkillModel.findOne({
        name: { $regex: `^${name}$`, $options: 'i' },
        type
      });

      if (!existingSkill) {
        const normalizedName = normalizeSkillName(name);

        let newSkill = new SkillModel({
          name: normalizedName,
          type,
          creator: _userId,
          createdTime: Date.now()
        });

        await newSkill.save();
      }
    }

    return true;
  }

  @Mutation(() => Boolean, {
    description: 'Deletes team specific skills'
  })
  @Authorized()
  async deleteTeamSkills(
    @Args() { teamId, ids }: DeleteTeamSkillsArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    const team = await TeamModel.findOne({ _id: teamId });
    if (!team) {
      return new Error('Team not found');
    }

    const userTeam = await UserTeamModel.findOne({
      user: _userId,
      team: team._id
    });
    if (!userTeam) {
      return new Error("You're not a member of this team");
    }

    if (!['owner', 'admin'].includes(userTeam.role)) {
      return new Error('Only team owners or admins can delete team skills');
    }

    if (!isPro(team.plan)) {
      return new Error('Upgrade your plan');
    }

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];

      const skill = await SkillModel.findOne({ _id: id });
      if (!skill) {
        continue;
      }

      const teamSkillType = await TeamSkillTypeModel.findOne({
        _id: skill.type,
        team: team._id
      });
      if (!teamSkillType) {
        continue;
      }

      // Delete associated user skills
      await UserSkillModel.deleteMany({ skill: skill._id });

      // Delete associated user skill histories
      await UserSkillHistoryModel.deleteMany({ skill: skill._id });

      // Remove project skills
      await ProjectModel.update(
        {},
        { $pull: { skills: { skill: skill._id } } }
      );

      await skill.remove();
    }

    return true;
  }
}

function normalizeSkillName(name: string) {
  const normalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  return normalizedName;
}

export default SkillResolver;
