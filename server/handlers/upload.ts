import path from 'path';
import fs from 'fs';
import { Express } from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import Jimp from 'jimp';
import fileUpload from 'express-fileupload';
import fetch from 'node-fetch';

import { RootUri, MongoUri, GOOGLE_OAUTH_KEY, GOOGLE_OAUTH_SECRET, MountedDataPath } from '../config';
import { UserModel, IUser, TeamModel, ITeam, UserTeamModel } from '../core/db';
import { randomStr } from '../../shared/util/str';


export const updateUserAvatar = async (userId : string, data : Buffer) => {
  const fname = `avatar-${randomStr(8)}.png`;
  const img = await Jimp.read(data);
  var savePath = path.join(MountedDataPath, 'user', userId.toString(), fname);
  await img
    .resize(512, 512)
    .write(savePath);
  return fname;
};

export const removeUserAvatar = (user : IUser) => {
  if(!user.avatar)
    return;
  var avatarPath = path.join(MountedDataPath, 'user', user._id.toString(), user.avatar);
  if(fs.existsSync(avatarPath))
    fs.unlinkSync(avatarPath);
};

export const updateTeamAvatar = async (teamId : string, data : Buffer) => {
  const fname = `avatar-${randomStr(8)}.png`;
  const img = await Jimp.read(data);
  var savePath = path.join(MountedDataPath, 'team', teamId.toString(), fname);
  await img
    .resize(512, 512)
    .write(savePath);
  return fname;
};

export const removeTeamAvatar = (team : ITeam) => {
  if(!team.avatar)
    return;
  var avatarPath = path.join(MountedDataPath, 'team', team._id.toString(), team.avatar);
  if(fs.existsSync(avatarPath))
    fs.unlinkSync(avatarPath);
};

export const registerUploadHandlers = (server : Express) => {
  server.post('/user/:alias/avatar', async (req, res, next) => {
    // FIXME: `alias` param is ignored
    const user = req.user as IUser;
    if(!user) {
      res.status(403).json({ error: 'Not authenticated' });
      return;
    }
    if(!req.files?.avatar) {
      res.status(402).json({ error: 'No "avatar" was supplied' });
      return;
    }

    const avatar = req.files.avatar as fileUpload.UploadedFile;
    const fname = await updateUserAvatar(user._id.toString(), avatar.data);

    const userObj = await UserModel.findOne({ _id : user._id });
    if(userObj) {
      userObj.avatar = fname;
      await userObj.save();
    }

    res.json({});
  });

  server.delete('/user/:alias/avatar', async (req, res, next) => {
    // FIXME: `alias` param is ignored
    const user = req.user as IUser;
    if(!user) {
      res.status(403).json({ error: 'Not authenticated' });
      return;
    }

    removeUserAvatar(user);
    const userObj = await UserModel.findOne({ _id : user._id });
    if(userObj) {
      userObj.avatar = undefined;
      await userObj.save();
    }

    res.json({});
  });

  server.post('/team/:alias/avatar', async (req, res, next) => {
    const user = req.user as IUser;
    if(!user) {
      res.status(403).json({ error: 'Not authenticated' });
      return;
    }
    if(!req.files?.avatar) {
      res.status(402).json({ error: 'No "avatar" was supplied' });
      return;
    }

    const alias = req.params.alias;
    const team = (await TeamModel.findOne({ alias })) as ITeam;
    if(!team) {
      res.status(402).json({ error: 'Team not found' });
    }

    const hasPermissions = (await UserTeamModel.count({ user: user._id, team: team._id, role: { $in: ['owner', 'admin'] } })) > 0;
    if(!hasPermissions) {
      res.status(403).json({ error: 'Only team owners or admins can upload avatar' });
      return;
    }

    const avatar = req.files.avatar as fileUpload.UploadedFile;
    const fname = await updateTeamAvatar(team._id.toString(), avatar.data);
    team.avatar = fname;
    await team.save();

    res.json({});
  });

  server.delete('/team/:alias/avatar', async (req, res, next) => {
    const user = req.user as IUser;
    if(!user) {
      res.status(403).json({ error: 'Not authenticated' });
      return;
    }

    const alias = req.params.alias;
    const team = (await TeamModel.findOne({ alias })) as ITeam;
    if(!team) {
      res.status(402).json({ error: 'Team not found' });
    }

    const hasPermissions = (await UserTeamModel.count({ user: user._id, team: team._id, role: { $in: ['owner', 'admin'] } })) > 0;
    if(!hasPermissions) {
      res.status(403).json({ error: 'Only team owners or admins can remove avatar' });
      return;
    }

    removeTeamAvatar(team);
    team.avatar = undefined;
    await team.save();

    res.json({});
  });
};
