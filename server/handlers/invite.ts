import { Express } from 'express';

import { IUser, TeamModel, ITeam, UserTeamModel, TeamInviteModel, ITeamInvite, UserModel } from '../core/db';
import { randomStr } from '../../shared/util/str';
import { RootUri } from '../config';
import { sendEmail, sendEmailTemplate } from '../core/email';
import { trackActiveCampaignEventQueue } from '../queues';

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

  // Assign the active team
  const userObj = await UserModel.findOne({ _id: user.id });
  if(userObj) {
    userObj.activeTeam = team.id;
    await userObj.save();
  }

  trackActiveCampaignEventQueue.add({
    email: user.login,
    event: 'user joined a team'
  });

  return { team };
};

export const registerInviteHandlers = async (server : Express) => {
  server.get('/invite/:key', async (req, res, next) => {
    const key = req.params.key as string;

    const invite = await TeamInviteModel.findOne({ key });
    if(!invite) {
      res.status(403).send('This invite link has expired');
      return;
    }

    // TODO: offer to sign up
    const user = req.user as IUser;
    if(!user) {
      res.cookie('inviteKey', key);
      res.redirect(`/signup?inviteEmail=${invite.email || ''}`);
      // res.status(403).json({ error: 'Not authenticated' });
      return;
    }

    const { err: execErr, team } = await executeInvite(user, invite);
    if(execErr) {
      res.status(402).send(execErr);
      return;
    }

    // TODO: set the team as active if it's the user's first one

    res.redirect(`/team/${team?.alias}`);
  });
};
