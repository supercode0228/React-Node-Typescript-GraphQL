/**
 * @format
 */

import { Length, Matches } from 'class-validator';
import escapeStringRegexp from 'escape-string-regexp';
import { GraphQLResolveInfo } from 'graphql';
import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  ID,
  Info,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from 'type-graphql';
import { AliasPattern } from '../../../shared/config';
import { assignFieldsIfNotNull } from '../../../shared/util/object';
import { isPro } from '../../../shared/util/plan';
import { randomStr } from '../../../shared/util/str';
import { RootUri } from '../../config';
import { trackActiveCampaignEventQueue } from '../../queues';
import {
  ConfirmationModel,
  IProject,
  ITeam,
  ITeamProject,
  ITeamSkillType,
  IUser,
  IUserTeam,
  ProjectModel,
  SkillModel,
  TeamInviteModel,
  TeamModel,
  TeamProjectModel,
  TeamSkillTypeModel,
  UserModel,
  UserProjectModel,
  UserSkillHistoryModel,
  UserSkillModel,
  UserTeamModel
} from '../db';
import { sendEmailTemplate } from '../email';
import { Project } from './project.resolver';
import { getResolveFields } from './shared';
import { User } from './user.resolver';

@ObjectType()
export class Team {
  @Field(() => ID)
  id: string = '';

  @Field()
  name: string = '';

  @Field()
  alias: string = '';

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  about?: string;

  @Field({ nullable: true })
  website?: string;

  @Field(() => [String], { nullable: true })
  locations?: string[];

  @Field(() => [String], { nullable: true })
  skillAreas?: string[];

  @Field({ nullable: true })
  myRole?: string;

  @Field(() => [UserTeam], { nullable: true })
  users?: UserTeam[];

  @Field(() => [TeamProject], { nullable: true })
  projects?: TeamProject[];

  @Field(() => [InvitedUser], { nullable: true })
  invites?: InvitedUser[];

  @Field(() => [TeamSkillType], { nullable: true })
  skillTypes?: TeamSkillType[];

  @Field({ nullable: true })
  plan?: string;
}

@ObjectType()
export class UserTeam {
  @Field(() => User)
  user: User = new User();

  @Field(() => Team)
  team: Team = new Team();

  @Field()
  role: String = '';

  @Field({ nullable: true })
  external?: Boolean;

  @Field({ nullable: true })
  skillArea?: String;

  @Field({ nullable: true })
  location?: String;

  @Field((type) => [ID], { nullable: true })
  directManager?: string[];
}

@ObjectType()
class TeamProject {
  @Field(() => Team)
  team: Team = new Team();

  @Field(() => Project)
  project: Project = new Project();
}

@ObjectType()
export class InvitationInfo {
  @Field(() => Team)
  team: Team = new Team();

  @Field(() => String, { nullable: true })
  email?: string;
}

@ObjectType()
class InvitedUser {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  email: string = '';

  @Field()
  key: string = '';
}

@ObjectType()
export class TeamSkillType {
  @Field(() => ID)
  id: string = '';

  @Field()
  name: string = '';

  @Field()
  visualization: string = 'bubbles';

  @Field({ nullable: true })
  team?: string;

  @Field()
  createdAt: Date = new Date();

  @Field()
  updatedAt: Date = new Date();
}

@InputType()
class TeamInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  @Length(1, 255)
  name?: string;

  @Field({ nullable: true })
  @Matches(/^[a-zA-Z0-9-_\.]{1,255}$/)
  alias?: string;

  @Field({ nullable: true })
  @Length(1, 4096)
  about?: string;

  @Field({ nullable: true })
  @Length(1, 255)
  website?: string;

  @Field(() => [String], { nullable: true })
  locations?: string[];

  @Field(() => [String], { nullable: true })
  skillAreas?: string[];
}

@InputType()
class TeamMemberInput {
  @Field(() => ID)
  teamId?: string;

  @Field(() => ID)
  id?: string;

  @Field({ nullable: true })
  @Length(1, 255)
  role?: string;

  @Field({ nullable: true })
  external?: boolean;
}

@InputType()
class TeamSkillTypeInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  visualization?: string;
}

@ArgsType()
class TeamArgs {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  @Matches(AliasPattern)
  alias?: string;
}

@ArgsType()
class DeleteTeamArgs {
  @Field(() => ID)
  id?: string;
}

@ArgsType()
class TeamMembersArgs extends TeamArgs {
  @Field(() => String, { nullable: true })
  skillArea?: string;

  @Field(() => String, { nullable: true })
  textFilter?: string;
}

@ArgsType()
class TeamCredentialsArgs {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  @Matches(AliasPattern)
  alias?: string;
}

@ArgsType()
class InvitationInfoArgs {
  @Field(() => String)
  key: string = '';
}

@ArgsType()
class TeamInviteArgs {
  @Field(() => ID)
  id?: string;

  @Field(() => [String])
  emails: string[] = [];
}

@ArgsType()
class TeamInviteLinkArgs {
  @Field(() => ID)
  id?: string;
}

@ArgsType()
class CancelTeamInviteArgs {
  @Field(() => String)
  key: string = '';
}

@ArgsType()
class RemoveTeamMemberArgs {
  @Field(() => ID)
  teamId: string = '';

  @Field(() => ID)
  userId: string = '';
}

@ArgsType()
class TeamSkillTypeArgs {
  @Field(() => ID)
  teamId: string = '';
}

@ArgsType()
class UpdateTeamSkillTypeArgs {
  @Field(() => ID)
  teamId: string = '';

  @Field(() => TeamSkillTypeInput)
  input: TeamSkillTypeInput = new TeamSkillTypeInput();
}

@ArgsType()
class DeleteTeamSkillTypeArgs {
  @Field(() => ID)
  teamId: string = '';

  @Field(() => ID)
  id: string = '';
}

@Resolver(Team)
class TeamResolver {
  @Query(() => Boolean, {
    description: 'Check team credentials availability'
  })
  async checkTeamCredentialsAvailable(
    @Args() { id, alias }: TeamCredentialsArgs
  ) {
    if (!alias) {
      return false;
    }

    return await checkCredentials(id, alias);
  }

  @Query(() => Team, {
    description: 'Returns team information by id or alias'
  })
  @Authorized()
  async team(
    @Args() { id, alias }: TeamArgs,
    @Info() resolveInfo: GraphQLResolveInfo,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    if (!id && !alias) {
      return null;
    }

    let query = {};

    if (alias) {
      query = { ...query, alias };
    } else if (id) {
      query = { ...query, _id: id };
    }

    const team = await TeamModel.findOne(query);
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

    team.myRole = userTeam.role;

    const resolveFields = getResolveFields(resolveInfo);

    if ('users' in resolveFields.Team) {
      team.users = await UserTeamModel.find({ team: team._id }).populate({
        path: 'user'
      });
    }

    if ('projects' in resolveFields.Team) {
      team.projects = await TeamProjectModel.find({ team: team._id }).populate({
        path: 'project'
      });

      if (
        'users' in
        resolveFields.Team.projects.fieldsByTypeName.TeamProject.project
          .fieldsByTypeName.Project
      ) {
        await Promise.all(
          team.projects.map(async (teamProject) => {
            ((teamProject as ITeamProject).project as IProject).users =
              await UserProjectModel.find({
                project: ((teamProject as ITeamProject).project as IProject).id
              })
                .limit(3)
                .populate({
                  path: 'user'
                });
          })
        );
      }
    }

    if (
      'invites' in resolveFields.Team &&
      ['owner', 'admin'].includes(team.myRole)
    ) {
      team.invites = await TeamInviteModel.find({
        team: team._id,
        email: { $exists: true }
      }).populate({
        path: 'user'
      });
    }

    if ('skillTypes' in resolveFields.Team && isPro(team.plan)) {
      team.skillTypes = await TeamSkillTypeModel.find({ team: team._id });
    }

    return team;
  }

  @Query(() => [TeamSkillType], {
    description: 'Returns skill types for a specific team'
  })
  @Authorized()
  async teamSkillTypes(
    @Args() { teamId }: TeamSkillTypeArgs,
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

    if (!isPro(team.plan)) {
      return new Error('Upgrade your plan');
    }

    const skillTypes = await TeamSkillTypeModel.find({ team: team._id });

    return skillTypes;
  }

  @Query(() => [UserTeam], {
    description: 'Returns team members for a specific team'
  })
  @Authorized()
  async teamMembers(
    @Args() { id, alias, skillArea, textFilter }: TeamMembersArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    if (!id && !alias) {
      return null;
    }

    let query = {};

    if (alias) {
      query = { ...query, alias };
    } else if (id) {
      query = { ...query, _id: id };
    }

    const team = await TeamModel.findOne(query);
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

    let userTeamQuery = {};
    userTeamQuery = { team: team._id };

    if (skillArea) {
      userTeamQuery = { ...userTeamQuery, skillArea };
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

    const userTeams = (
      await UserTeamModel.find(userTeamQuery).populate({
        path: 'user',
        match: userQuery
      })
    ).filter((userTeam) => userTeam.user);

    userTeams.forEach((userTeam) => {
      if (
        ((userTeam as IUserTeam).user as IUser)._id.toString() ===
        _userId.toString()
      )
        ((userTeam as IUserTeam).user as IUser).me = true;
    });

    return userTeams;
  }

  @Query(() => InvitationInfo, {
    description: 'Returns info about a specific team invitation'
  })
  async invitationInfo(@Args() { key }: InvitationInfoArgs) {
    const invite = await TeamInviteModel.findOne({ key }).populate('team');
    if (!invite) {
      return new Error('The invite link has expired');
    }

    return {
      team: invite.team,
      email: invite.email
    };
  }

  @Mutation(() => Team, {
    description: 'Creates or updates a team'
  })
  @Authorized()
  async updateTeamData(
    @Arg('data')
    { id, name, alias, about, website, locations, skillAreas }: TeamInput,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    if (alias) {
      const credentialsAvailable = await checkCredentials(id, alias);
      if (!credentialsAvailable) {
        return new Error('Requested credentials are not available');
      }
    }

    let team: ITeam;
    let teamCreated = false;

    if (id) {
      team = (await TeamModel.findOne({ _id: id })) as ITeam;
      if (!team) {
        return new Error('Team not found');
      }

      const hasPermissions =
        (await UserTeamModel.countDocuments({
          user: _userId,
          team: team._id,
          role: { $in: ['owner', 'admin'] }
        })) > 0;
      if (!hasPermissions) {
        return new Error('Access denied');
      }
    } else {
      team = new TeamModel();
      teamCreated = true;
    }

    assignFieldsIfNotNull(team, {
      name,
      alias,
      about,
      website,
      locations,
      skillAreas
    });

    team = await team.save();

    if (teamCreated) {
      // Link the team's creator with the 'owner' role
      const userTeam = new UserTeamModel({
        user: _userId,
        team,
        role: 'owner'
      });
      await userTeam.save();

      if (currentUser) {
        trackActiveCampaignEventQueue.add({
          email: currentUser.login,
          event: 'user created a team'
        });
      }
    }

    return team;
  }

  @Mutation(() => Boolean, {
    description:
      'Creates a team removal confirmation and sends instructions to the user'
  })
  @Authorized()
  async deleteTeam(
    @Args() { id }: DeleteTeamArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    const user = await UserModel.findOne({ _id: _userId });
    if (!user) {
      return new Error('User not found');
    }

    const team = await TeamModel.findOne({ _id: id });
    if (!team) {
      return new Error('Team not found');
    }

    const hasPermissions =
      (await UserTeamModel.countDocuments({
        user: _userId,
        team: team._id,
        role: { $in: ['owner', 'admin'] }
      })) > 0;
    if (!hasPermissions) {
      return new Error('Only team owners or admins can remove teams');
    }

    const confirmation = new ConfirmationModel({
      user,
      action: `team/${team._id}/delete`,
      key: randomStr(32),
      validUntil: Date.now() + 86000000
    });
    await confirmation.save();

    const confirmLink = `${RootUri}/confirm/${confirmation.key}`;
    const dashboardLink = `${RootUri}/dashboard`;

    await sendEmailTemplate(user.login, `Tests Team Deletion`, 'teamDeletion', {
      name: team.name,
      confirmLink,
      dashboardLink
    });

    return true;
  }

  @Mutation(() => Boolean, {
    description: 'Updates a team member'
  })
  @Authorized()
  async updateTeamMember(
    @Arg('data') { teamId, id, role, external }: TeamMemberInput,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    if (id?.toString() === _userId.toString()) {
      return new Error('You cannot change your own role');
    }

    const team = await TeamModel.findOne({ _id: teamId });
    if (!team) {
      return new Error('Team not found');
    }

    const hasPermissions =
      (await UserTeamModel.countDocuments({
        user: _userId,
        team: team._id,
        role: { $in: ['owner', 'admin'] }
      })) > 0;
    if (!hasPermissions) {
      return new Error('Only team owners or admins can update team members');
    }

    const userTeam = await UserTeamModel.findOne({ user: id, team: teamId });
    if (!userTeam) {
      return new Error('Member not found');
    }

    assignFieldsIfNotNull(userTeam, {
      role,
      external
    });

    await userTeam.save();

    return true;
  }

  @Mutation(() => Boolean)
  @Authorized()
  async removeTeamMember(
    @Args() { userId, teamId }: RemoveTeamMemberArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    const team = await TeamModel.findOne({ _id: teamId });
    if (!team) {
      return new Error('Team not found');
    }

    const hasPermissions =
      (await UserTeamModel.countDocuments({
        user: _userId,
        team: team._id,
        role: { $in: ['owner', 'admin'] }
      })) > 0;
    if (!hasPermissions && userId.toString() !== _userId.toString()) {
      return new Error('Only team owners or admins can remove team members');
    }

    const userTeam = await UserTeamModel.findOne({ user: userId, team });
    if (!userTeam) {
      return new Error('Member not found');
    }

    await userTeam.remove();

    return true;
  }

  @Mutation(() => Boolean, {
    description: 'Invites users to the team'
  })
  @Authorized()
  async teamInvite(
    @Args() { id, emails }: TeamInviteArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    const team = await TeamModel.findOne({ _id: id });
    if (!team) {
      return new Error('Team not found');
    }

    const hasPermissions =
      (await UserTeamModel.countDocuments({
        user: _userId,
        team: team._id,
        role: { $in: ['owner', 'admin'] }
      })) > 0;
    if (!hasPermissions) {
      return new Error('Only team owners or admins can invite team members');
    }

    for (let i = 0; i < emails.length; i++) {
      // TODO: validate the e-mail format
      // TODO: resolve existing users and create notifications for 'em
      // TODO: check whether user is already a team's member
      // TODO: invite's ttl
      // TODO: per-team invitation limits and throttling

      const email = emails[i];
      const invite = new TeamInviteModel({
        email,
        team: team._id,
        key: randomStr(32),
        userLimit: 1
      });
      await invite.save();

      const inviteLink = `${RootUri}/team/${team.alias}/invitation?key=${invite.key}`;

      await sendEmailTemplate(email, `Welcome to Tests`, 'teamInvite', {
        teamName: team.name,
        inviteLink
      });

      trackActiveCampaignEventQueue.add({
        email: email,
        event: 'user was invited to a team'
      });
    }

    return true;
  }

  @Mutation(() => String, {
    description: 'Creates a shareable team invite link'
  })
  @Authorized()
  async teamInviteLink(
    @Args() { id }: TeamInviteLinkArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    const team = await TeamModel.findOne({ _id: id });
    if (!team) {
      return new Error('Team not found');
    }

    const hasPermissions =
      (await UserTeamModel.countDocuments({
        user: _userId,
        team: team._id,
        role: { $in: ['owner', 'admin'] }
      })) > 0;
    if (!hasPermissions) {
      return new Error('Only team owners or admins can create invite links');
    }

    // TODO: invite's ttl
    const invite = new TeamInviteModel({
      team: team._id,
      key: randomStr(32),
      userLimit: 200
    });
    await invite.save();

    const inviteLink = `${RootUri}/team/${team.alias}/invitation?key=${invite.key}`;

    return inviteLink;
  }

  @Mutation(() => Boolean, {
    description: 'Removes a team invite'
  })
  @Authorized()
  async cancelTeamInvite(
    @Args() { key }: CancelTeamInviteArgs,
    @Ctx('user') currentUser?: IUser
  ) {
    const _userId = currentUser?._id;

    const invite = await TeamInviteModel.findOne({ key });
    if (!invite) {
      return new Error('Invite not found');
    }

    const team = await TeamModel.findOne({ _id: invite.team });
    if (!team) {
      return new Error('Team not found');
    }

    const hasPermissions =
      (await UserTeamModel.countDocuments({
        user: _userId,
        team: team._id,
        role: { $in: ['owner', 'admin'] }
      })) > 0;
    if (!hasPermissions) {
      return new Error('Only team owners or admins can remove invites');
    }

    await invite.remove();

    return true;
  }

  @Mutation(() => TeamSkillType, {
    description: 'Creates or updates a team skill type'
  })
  @Authorized()
  async updateTeamSkillType(
    @Args()
    { teamId, input: { id, name, visualization } }: UpdateTeamSkillTypeArgs,
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
      return new Error('Only team owners or admins can manage skill types');
    }

    if (!isPro(team.plan)) {
      return new Error('Upgrade your plan');
    }

    let teamSkillType: ITeamSkillType;

    if (id) {
      teamSkillType = (await TeamSkillTypeModel.findOne({
        _id: id,
        team: team._id
      })) as ITeamSkillType;

      if (!teamSkillType) {
        return new Error('Skill type not found');
      }
    } else {
      teamSkillType = new TeamSkillTypeModel({ team: teamId });
    }

    assignFieldsIfNotNull(teamSkillType, {
      name,
      visualization
    });

    teamSkillType = await teamSkillType.save();

    return teamSkillType;
  }

  @Mutation(() => Boolean, {
    description: 'Deletes a team skill type'
  })
  @Authorized()
  async deleteTeamSkillType(
    @Args() { teamId, id }: DeleteTeamSkillTypeArgs,
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
      return new Error('Only team owners or admins can delete skill types');
    }

    const teamSkillType = await TeamSkillTypeModel.findOne({
      _id: id,
      team: team._id
    });
    if (!teamSkillType) {
      return new Error('Skill type not found');
    }

    if (!isPro(team.plan)) {
      return new Error('Upgrade your plan');
    }

    const skillIds = (await SkillModel.find({ type: teamSkillType._id })).map(
      (skill) => skill._id
    );

    // Delete associated user skills
    await UserSkillModel.deleteMany({ skill: { $in: skillIds } });

    // Delete associated user skill histories
    await UserSkillHistoryModel.deleteMany({ skill: { $in: skillIds } });

    // Remove associated skills
    await SkillModel.deleteMany({
      _id: { $in: skillIds },
      type: teamSkillType._id
    });

    // Remove project skills
    await ProjectModel.update(
      {},
      { $pull: { skills: { skill: { $in: skillIds } } } },
      { multi: true }
    );

    await teamSkillType.remove();

    return true;
  }
}

const checkCredentials = async (teamId?: string, alias?: string) => {
  let query: { $or: any[] } = { $or: [] };

  if (alias) {
    const regexAlias = new RegExp(['^', alias, '$'].join(''), 'i');
    query.$or.push({ alias: { $regex: regexAlias } });
  }

  const team = await TeamModel.findOne(query);
  if (team == null) {
    return true;
  }

  return team._id.toString() === teamId;
};

export default TeamResolver;
