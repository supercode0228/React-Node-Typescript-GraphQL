/**
 * @format
 */

import { ArrayMaxSize, Length } from 'class-validator';
import escapeStringRegexp from 'escape-string-regexp';
import { GraphQLResolveInfo } from 'graphql';
import _ from 'lodash';
import {
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  Float,
  ID,
  Info,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from 'type-graphql';
import { assignFieldsIfNotNull } from '../../../shared/util/object';
import { randomStr } from '../../../shared/util/str';
import { trackActiveCampaignEventQueue } from '../../queues';
import {
  IProject,
  ISkill,
  ITeam,
  IUser,
  IUserAvailability,
  IUserProject,
  IUserSkill,
  IUserTeam,
  ProjectModel,
  SkillModel,
  TeamModel,
  TeamProjectModel,
  UserAvailabilityModel,
  UserProjectModel,
  UserSkillModel,
  UserTeamModel
} from '../db';
import { getResolveFields } from './shared';
import { AssignedSkill, AssignedSkillInput } from './skill.resolver';
import { Team } from './team.resolver';
import { User, UserAvailability } from './user.resolver';

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string = '';

  @Field()
  accessKey: string = '';

  @Field()
  name: string = '';

  @Field()
  draft: boolean = true;

  @Field(() => Float, { nullable: true })
  startTime?: number;

  @Field(() => Float, { nullable: true })
  endTime?: number;

  @Field({ nullable: true })
  about?: string;

  @Field({ nullable: true })
  myRole?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [String], { nullable: true })
  references?: string[];

  @Field({ nullable: true })
  team?: Team;

  @Field(() => User, { nullable: true })
  creator?: User;

  @Field(() => [UserProject], { nullable: true })
  users?: UserProject[];

  @Field(() => [AssignedSkill], { nullable: true })
  skills?: AssignedSkill[];
}

@ArgsType()
class TeamProjectsArgs {
  @Field(() => ID)
  id: string = '';
}

@ArgsType()
class ProjectMembersArgs {
  @Field(() => ID)
  id: string = '';

  @Field(() => Float, { nullable: true })
  startTime?: number;

  @Field(() => Float, { nullable: true })
  endTime?: number;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field(() => String, { nullable: true })
  textFilter?: string;
}

@ArgsType()
class SuggestProjectMembersArgs {
  @Field(() => ID)
  id: string = '';

  @Field(() => Float)
  startTime: number = 0;

  @Field(() => Float)
  endTime: number = 0;

  @Field(() => [String])
  skills: string[] = [];

  @Field(() => String, { nullable: true })
  textFilter?: string;
}

@ArgsType()
class ProjectMemberAvailabilityTimelineArgs {
  @Field(() => ID)
  id: string = '';

  @Field(() => String, { nullable: true })
  accessKey?: string;

  @Field(() => Float)
  startTime: number = 0;

  @Field(() => Float)
  endTime: number = 0;

  @Field(() => [String])
  users: string[] = [];
}

@ObjectType()
export class ProjectMember {
  @Field(() => User)
  user: User = new User();

  @Field({ nullable: true })
  external?: Boolean;

  @Field(() => [UserAvailability])
  @ArrayMaxSize(40)
  availability: IUserAvailability[] = [];

  @Field(() => [AssignedSkill])
  coveredSkills: IUserSkill[] = [];

  @Field(() => Float)
  avgAvailability: number = 1.0;

  @Field(() => Float, {
    description:
      'How fit some is for the project in terms of skills / availability'
  })
  fit: number = 1.0;
}

interface IProjectMember extends ProjectMember {}

@ArgsType()
class ProjectArgs {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  accessKey?: string;
}

@ArgsType()
class SetProjectMembersArgs {
  @Field(() => ID)
  projectId: string = '';

  @Field(() => [ID])
  users: string[] = [];
}

@InputType()
class ProjectInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  @Length(1, 255)
  name?: string;

  @Field({ nullable: true })
  draft?: boolean;

  @Field(() => Float, { nullable: true })
  startTime?: number;

  @Field(() => Float, { nullable: true })
  endTime?: number;

  @Field({ nullable: true })
  @Length(1, 4096)
  about?: string;

  @Field(() => [String], { nullable: true })
  @ArrayMaxSize(20)
  tags?: string[];

  @Field(() => [String], { nullable: true })
  @ArrayMaxSize(20)
  references?: string[];

  @Field(() => [AssignedSkillInput], { nullable: true })
  @ArrayMaxSize(20)
  skills?: AssignedSkillInput[];
}

@ObjectType()
export class UserProject {
  @Field(() => User)
  user: User = new User();

  @Field(() => Project)
  project: Project = new Project();

  @Field()
  role: String = '';
}

@ArgsType()
class UpdateProjectArgs {
  @Field(() => String, { nullable: true })
  team?: string;

  @Field(() => ProjectInput)
  data: ProjectInput = new ProjectInput();
}

@ArgsType()
class RemoveProjectArgs {
  @Field(() => ID)
  id: string = '';
}

@ArgsType()
class RemoveProjectMemberArgs {
  @Field(() => ID)
  projectId: string = '';

  @Field(() => ID)
  userId: string = '';
}

@Resolver(Project)
class ProjectResolver {
  @Query(() => Project)
  async project(
    @Args() { id, accessKey }: ProjectArgs,
    @Info() resolveInfo: GraphQLResolveInfo,
    @Ctx('user') userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    if (!id) {
      return null;
    }

    const project = await ProjectModel.findOne({ _id: id });
    if (!project) {
      return new Error('Project not found');
    }

    const teamProject = await TeamProjectModel.findOne({ project: id });

    const userTeam = await UserTeamModel.findOne({
      user: _userId,
      team: teamProject?.team
    });

    if (!userTeam && accessKey !== project.accessKey) {
      return new Error('Access denied');
    }

    // Resolve project creator
    project.creator = (
      await UserProjectModel.findOne({
        project: project._id,
        role: 'owner'
      }).populate('user')
    )?.user as IUser;

    // Resolve current user role
    const isOwner = project.creator.id.toString() === _userId.toString();
    if (isOwner) {
      project.myRole = 'owner';
    } else {
      const userProject = await UserProjectModel.findOne({
        user: _userId,
        project
      });

      project.myRole = userProject?.role || 'none';
    }

    const resolveFields = getResolveFields(resolveInfo);

    // Resolve project users
    if ('users' in resolveFields.Project) {
      project.users = await UserProjectModel.find({
        project: project.id,
        role: 'member'
      }).populate('user');

      project.users.forEach((projectUser) => {
        const user = (projectUser as IUserProject).user as IUser;

        if (user.id.toString() === _userId?.toString()) {
          user.me = true;
        }
      });
    }

    // Resolve project team
    if ('team' in resolveFields.Project) {
      project.team = (
        await TeamProjectModel.findOne({ project: project.id }).populate('team')
      )?.team as ITeam;
    }

    // Resolve project skills
    if ('skills' in resolveFields.Project) {
      const resolvedSkills = await SkillModel.find({
        _id: { $in: project.skills?.map((projectSkill) => projectSkill.skill) }
      });

      const resolvedSkillMap = new Map(
        resolvedSkills.map((skill) => [skill._id.toString(), skill])
      );

      project.skills?.forEach(
        (projectSkill) =>
          (projectSkill.skill = resolvedSkillMap.get(
            projectSkill.skill.toString()
          ) as ISkill)
      );
    }

    return project;
  }

  @Query(() => [UserProject], {
    description: 'The `user` parameter in these records is the project owner'
  })
  @Authorized()
  async teamProjects(
    @Args() { id }: TeamProjectsArgs,
    @Info() resolveInfo: GraphQLResolveInfo,
    @Ctx('user') userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    const team = await TeamModel.findOne({ _id: id });
    if (!team) {
      return new Error('Team not found');
    }

    const userTeam = await UserTeamModel.findOne({
      user: _userId,
      team: team._id
    });

    if (!userTeam) {
      return new Error('You are not a member of this team');
    }

    const resolveFields = getResolveFields(resolveInfo);

    const teamProjects = await TeamProjectModel.find({
      team: team.id
    }).populate('project');

    const userProjects = await UserProjectModel.find({
      project: { $in: teamProjects.map((teamProject) => teamProject.project) }
    }).populate('user');

    teamProjects.forEach((teamProject) => {
      const project = teamProject.project as IProject;

      // Resolve project creator
      project.creator = userProjects.find(
        (userProject) =>
          userProject.project.toString() === project.id.toString() &&
          userProject.role === 'owner'
      )?.user as IUser;

      // Resolve current user role
      const isOwner = project.creator.id.toString() === _userId.toString();
      if (isOwner) {
        project.myRole = 'owner';
      } else {
        project.myRole =
          userProjects.find(
            (userProject) =>
              userProject.project.toString() === project.id.toString() &&
              (userProject.user as IUser).id.toString() === _userId.toString()
          )?.role || 'none';
      }
    });

    // Resolve project users
    if ('users' in resolveFields.UserProject.project.fieldsByTypeName.Project) {
      await Promise.all(
        teamProjects.map(async (teamProject) => {
          const project = teamProject.project as IProject;

          project.users = await UserProjectModel.find({
            project: project.id,
            role: 'member'
          }).populate('user');
        })
      );
    }

    return teamProjects;
  }

  async calculateProjectMembers(
    members: IUserTeam[],
    startTime: number,
    endTime: number,
    skills: string[]
  ) {
    const memberMap: { [id: string]: IProjectMember } = members.reduce(
      (map: any, member) => {
        map[(member.user as IUser).id] = {
          user: member.user,
          external: member.external,
          availability: [],
          coveredSkills: [],
          avgAvailability: 1.0,
          fit: 0.0
        };

        return map;
      },
      {}
    );

    const userAvailabilities = await UserAvailabilityModel.find({
      user: { $in: Object.keys(memberMap) },
      endTime: { $gte: startTime },
      startTime: { $lt: endTime }
    });

    userAvailabilities.forEach((userAvailability) =>
      memberMap[userAvailability.user as string].availability.push(
        userAvailability
      )
    );

    const userSkills = await UserSkillModel.find({
      user: { $in: Object.keys(memberMap) },
      skill: { $in: skills }
    }).populate('skill');

    userSkills.forEach((userSkill) =>
      memberMap[userSkill.user as string].coveredSkills.push(userSkill)
    );

    const baseAvailability: number[] = _.range(
      startTime,
      endTime,
      86400000
    ).map((t) => {
      const tDate = new Date(t);
      if (tDate.getUTCDay() === 0 || tDate.getUTCDay() === 6) {
        return 0.0;
      }

      return 1.0;
    });

    // Calculate member's fitness for the project
    Object.keys(memberMap).forEach((id) => {
      const member = memberMap[id];
      const tAvailability = baseAvailability.slice();

      // Apply unavailability records
      member.availability.forEach((availability) => {
        for (
          let t = Math.max(availability.startTime, startTime);
          t < Math.min(availability.endTime, endTime);
          t += 86400000
        ) {
          const dayOfWeek = new Date(t).getUTCDay();
          if (
            (availability.type === 'planned' &&
              availability.daysOfWeek?.includes(dayOfWeek)) ||
            availability.type === 'vacation'
          ) {
            const dayIdx = Math.floor((t - startTime) / 86400000);
            tAvailability[dayIdx] = Math.max(
              tAvailability[dayIdx] - (availability.percentAway || 1.0),
              0.0
            );
          }
        }
      });

      // Compute average availability
      let availaibilitySum = 0.0;
      let nDays = 0;

      tAvailability.forEach((d, j) => {
        const tDate = new Date(startTime + j * 86400000);
        if (tDate.getUTCDay() > 0 && tDate.getUTCDay() < 6) {
          // Is a business day
          availaibilitySum += d;
          nDays++;
        }
      });

      member.avgAvailability = availaibilitySum / Math.max(nDays, 1.0);

      // Member's fit is `average_skill_coverage * average_availability`
      member.fit = member.coveredSkills.length / Math.max(skills.length, 1);
      member.fit *= member.avgAvailability;
    });

    const memberList = Object.values(memberMap).sort((a, b) => b.fit - a.fit);

    return memberList;
  }

  @Query(() => [ProjectMember])
  @Authorized()
  async projectMembers(
    @Args() { id, startTime, endTime, skills, textFilter }: ProjectMembersArgs,
    @Ctx('user') userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    if (!id) {
      return null;
    }

    const project = await ProjectModel.findOne({ _id: id });
    if (!project) {
      return new Error('Project not found');
    }

    const teamProject = await TeamProjectModel.findOne({ project: id });
    if (!teamProject) {
      return new Error('Team not found');
    }

    const userTeam = await UserTeamModel.findOne({
      user: _userId,
      team: teamProject.team
    });

    if (!userTeam) {
      return new Error('Access denied');
    }

    const userProjects = await UserProjectModel.find({
      project,
      role: 'member'
    });

    let userQuery = {};
    if (textFilter && textFilter !== '') {
      userQuery = {
        ...userQuery,
        $or: [
          {
            name: {
              $regex: `.*${escapeStringRegexp(textFilter)}.*`,
              $options: 'i'
            }
          },
          {
            jobTitle: {
              $regex: `.*${escapeStringRegexp(textFilter)}.*`,
              $options: 'i'
            }
          }
        ]
      };
    }
    const members = (
      await UserTeamModel.find({
        user: { $in: userProjects.map((u) => u.user) },
        team: teamProject.team
      }).populate({
        path: 'user',
        match: userQuery
      })
    ).filter((m) => m.user);

    const projectSkills =
      skills || project.skills?.map((s) => s.skill as string);

    const memberList = await this.calculateProjectMembers(
      members,
      startTime || project.startTime,
      endTime || project.endTime,
      projectSkills || []
    );

    return memberList;
  }

  @Query(() => [ProjectMember])
  @Authorized()
  async suggestProjectMembers(
    @Args()
    { id, startTime, endTime, skills, textFilter }: SuggestProjectMembersArgs,
    @Ctx('user') userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    if (!id) {
      return null;
    }

    const project = await ProjectModel.findOne({ _id: id });
    if (!project) {
      return new Error('Project not found');
    }

    const teamProject = await TeamProjectModel.findOne({ project: id });
    if (!teamProject) {
      return new Error('Team not found');
    }

    const userTeam = await UserTeamModel.findOne({
      user: _userId,
      team: teamProject.team
    });

    if (!userTeam) {
      return new Error('Access denied');
    }

    let userQuery = {};
    if (textFilter && textFilter !== '') {
      userQuery = {
        ...userQuery,
        $or: [
          {
            name: {
              $regex: `.*${escapeStringRegexp(textFilter)}.*`,
              $options: 'i'
            }
          },
          {
            jobTitle: {
              $regex: `.*${escapeStringRegexp(textFilter)}.*`,
              $options: 'i'
            }
          }
        ]
      };
    }
    const members = (
      await UserTeamModel.find({ team: teamProject.team }).populate({
        path: 'user',
        match: userQuery
      })
    ).filter((m) => m.user);

    const memberList = (
      await this.calculateProjectMembers(members, startTime, endTime, skills)
    ).slice(0, 7);

    return memberList;
  }

  @Query(() => [UserAvailability])
  async projectMemberAvailabilityTimeline(
    @Args()
    {
      id,
      accessKey,
      startTime,
      endTime,
      users
    }: ProjectMemberAvailabilityTimelineArgs,
    @Ctx('user') userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    if (!id) {
      return null;
    }

    const project = await ProjectModel.findOne({ _id: id });
    if (!project) {
      return new Error('Project not found');
    }

    const teamProject = await TeamProjectModel.findOne({ project: id });

    const userTeam = await UserTeamModel.findOne({
      user: _userId,
      team: teamProject?.team
    });

    if (!userTeam && accessKey !== project.accessKey) {
      return new Error('Access denied');
    }

    const availability = await UserAvailabilityModel.find({
      user: { $in: users },
      endTime: { $gte: startTime },
      startTime: { $lt: endTime }
    });

    return availability;
  }

  @Mutation(() => Project, {
    description:
      'If `id` is not defined, but the `team` is - creates a new project'
  })
  @Authorized()
  async updateProjectData(
    @Args()
    {
      data: {
        id,
        startTime,
        endTime,
        name,
        draft,
        about,
        tags,
        references,
        skills
      },
      team
    }: UpdateProjectArgs,
    @Ctx('user') userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    let project: IProject;
    let projectCreated = false;

    if (id) {
      const isOwner =
        (await UserProjectModel.countDocuments({
          user: _userId,
          project: id,
          role: 'owner'
        })) > 0;

      if (!isOwner) {
        return new Error('Only the project owner may update project');
      }

      project = (await ProjectModel.findOne({ _id: id })) as IProject;
      if (!project) {
        return new Error('Cannot find the project record');
      }
    } else {
      if (!team || (await TeamModel.countDocuments({ _id: team })) < 1) {
        return new Error('You must specify an existing team');
      }

      // Create a new project
      project = new ProjectModel({ accessKey: randomStr(16) });
      projectCreated = true;
    }

    // Update the given fields
    assignFieldsIfNotNull(project, {
      startTime,
      endTime,
      name,
      draft: !project.draft ? false : draft, // Do not un-set the 'published' status
      about,
      tags,
      references,
      skills
    });

    project = await project.save();

    if (projectCreated) {
      const teamProject = new TeamProjectModel({ team, project });
      await teamProject.save();

      // Link the project's creator with the 'owner' role
      const userProject = new UserProjectModel({
        user: _userId,
        project,
        role: 'owner'
      });
      await userProject.save();

      if (userCtx) {
        trackActiveCampaignEventQueue.add({
          email: userCtx.login,
          event: 'user created a project'
        });
      }
    }

    return project;
  }

  @Mutation(() => Boolean)
  @Authorized()
  async setProjectMembers(
    @Args() { projectId, users }: SetProjectMembersArgs,
    @Ctx('user') userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    const project = await ProjectModel.findOne({ _id: projectId });
    if (!project) {
      return new Error('Project not found');
    }

    const teamProject = await TeamProjectModel.findOne({ project: projectId });
    if (!teamProject) {
      return new Error('Team not found');
    }

    const isOwner =
      (await UserProjectModel.countDocuments({
        user: _userId,
        project,
        role: 'owner'
      })) > 0;

    if (!isOwner) {
      return new Error('Only the project owner may set project members');
    }

    if (
      (await UserTeamModel.countDocuments({
        team: teamProject.team,
        user: { $in: users }
      })) !== users.length
    ) {
      return new Error('Some users were not found');
    }

    await UserProjectModel.remove({
      project: project._id,
      role: { $ne: 'owner' }
    });

    if (users.length > 0) {
      await UserProjectModel.insertMany(
        users.map((user) => ({ user, project, role: 'member' }))
      );
    }

    return true;
  }

  @Mutation(() => Boolean)
  @Authorized()
  async removeProjectMember(
    @Args() { userId, projectId }: RemoveProjectMemberArgs,
    @Ctx('user') userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    const project = (await ProjectModel.findOne({
      _id: projectId
    })) as IProject;

    if (!project) {
      return new Error('Project not found');
    }

    const isOwner =
      (await UserProjectModel.countDocuments({
        user: _userId,
        project,
        role: 'owner'
      })) > 0;

    if (!isOwner) {
      return new Error('Only the project owner may remove project members');
    }

    const member = await UserProjectModel.findOne({
      user: userId,
      project,
      role: 'member'
    });

    if (!member) {
      return new Error('Member not found');
    }

    await member.remove();

    return true;
  }

  @Mutation(() => Boolean)
  @Authorized()
  async removeProject(
    @Args() { id }: RemoveProjectArgs,
    @Ctx('user') userCtx?: IUser
  ) {
    const _userId = userCtx?._id;

    const project = await ProjectModel.findOne({ _id: id });
    if (!project) {
      return new Error('Project not found');
    }

    const teamProject = await TeamProjectModel.findOne({ project: id });
    if (!teamProject) {
      return new Error('Team not found');
    }

    const isOwner =
      (await UserProjectModel.countDocuments({
        user: _userId,
        project,
        role: 'owner'
      })) > 0;

    if (!isOwner) {
      return new Error('Only the project owner may remove projects');
    }

    if (!project.draft) {
      return new Error('Only draft projects can be removed');
    }

    await TeamProjectModel.remove({ project });
    await UserProjectModel.remove({ project });

    await project.remove();

    return true;
  }
}

export default ProjectResolver;
