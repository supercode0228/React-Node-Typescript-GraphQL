import { Express } from 'express';
import Email from 'email-templates';

import { IUser, TeamModel, ITeam, UserTeamModel, TeamInviteModel, ITeamInvite, ConfirmationModel, UserProjectModel, UserSkillModel, UserModel, PersonalNoteModel, UserSkillHistoryModel, UserAvailabilityModel, TeamProjectModel } from '../core/db';
import { randomStr } from '../../shared/util/str';
import { RootUri } from '../config';
import { sendEmail, getEmailTemplateGenerator } from '../core/email';
import { removeUserAvatar } from './upload';
import { deleteActiveCampaignContactQueue } from '../queues';

export const executeInvite = async (user : IUser, invite : ITeamInvite) => {
  // TODO: check whether requesting user is the same as the invited one

  const team = (await TeamModel.findOne({ _id: invite.team })) as ITeam;

  const alreadyJoined = (await UserTeamModel.countDocuments({ user: user._id, team: invite.team })) > 0;
  if(alreadyJoined) {
    return { err: "You've already joined this team" };
  }

  if(invite.userLimit > 0) {
    if(invite.userLimit > 1) {
      // Decrease the remaining invite count
      invite.userLimit--;
      await invite.save();
    } else {
      // All the invites were used - remove the record
      await invite.remove();
    }
  }

  const membership = new UserTeamModel({ user: user._id, team: team._id, role: 'member' });
  await membership.save();

  return { team };
};

export const registerConfirmHandlers = async (server : Express) => {
  server.get('/confirm/:key', async (req, res, next) => {
    const key = req.params.key as string;

    const confirmation = await ConfirmationModel.findOne({ key });
    if(!confirmation || confirmation.validUntil < Date.now()) {
      res.status(403).send('This confirmation link has expired');
      return;
    }

    const deleteTeamAction = /^team\/([\d\w]{24})\/delete$/;

    const user = confirmation.user as string;
    const userObj = await UserModel.findOne({ _id: user });
    if(confirmation.action === 'account/delete') {
      // TODO: Remove all the teams and projects the user owns
      await UserProjectModel.deleteMany({ user });
      await UserTeamModel.deleteMany({ user });
      await UserSkillModel.deleteMany({ user });
      await UserSkillHistoryModel.deleteMany({ user });
      await UserAvailabilityModel.deleteMany({ user });
      await PersonalNoteModel.deleteMany({ user });
      await ConfirmationModel.deleteMany({ user });
      if(userObj)
        removeUserAvatar(userObj);
      deleteActiveCampaignContactQueue.add({ user: userObj });
      await UserModel.deleteOne({ _id: user });
      res.redirect(`/accountRemoved`);
      await confirmation.remove();
      return;
    } else if(deleteTeamAction.test(confirmation.action)) {
      const teamId = deleteTeamAction.exec(confirmation.action)?.[1];
      if(!teamId) {
        res.status(402).send('Invalid team ID');
        return;
      }
      const team = await TeamModel.findOne({ _id: teamId });
      if(!team) {
        res.status(402).send('Team not found');
        return;
      }
      // TODO: Remove the projects themselves
      await TeamProjectModel.deleteMany({ team });
      await UserTeamModel.deleteMany({ team });
      await TeamModel.deleteOne({ _id: team.id });
      res.redirect(`/dashboard`);
      await confirmation.remove();
      return;
    }  else if(confirmation.action === 'account/resetPassword') {
      res.redirect(`/resetPassword?key=${key}`);
      return;
    } else if(confirmation.action === 'account/activate') {
      const user = await UserModel.findOne({ _id: confirmation.user });
      if(!user) {
        res.status(402).send('User not found');
        return;
      }
      user.emailVerified = true;
      await user.save();
      res.redirect(`/dashboard`);
      return;
    }

    res.redirect(`/login`);
  });

  server.get('/emailTest/:template', async (req, res, next) => {
    const template = req.params.template as string;

    const email = await getEmailTemplateGenerator();
    // const { filePath, paths } = await (email as any).getTemplatePath(template);
    const body = await email.render(template, {});

    res.send(body);
  });
};
