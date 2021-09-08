import path from 'path';
import fs from 'fs';
import { Express, Request, Response } from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import Jimp from 'jimp';
import fileUpload from 'express-fileupload';
import fetch from 'node-fetch';

import { RootUri, MongoUri, GOOGLE_OAUTH_KEY, GOOGLE_OAUTH_SECRET } from '../config';
import { UserModel, IUser, TeamInviteModel, ConfirmationModel, TeamModel, ProjectModel, UserSkillModel } from '../core/db';
import { updateUserAvatar } from './upload';
import { executeInvite } from './invite';
import { randomStr } from '../../shared/util/str';
import { PasswordPattern } from '../../shared/config';
import { sendEmailTemplate } from '../core/email';
import { syncActiveCampaignContactQueue } from '../queues';

const MongoStore = require('connect-mongo')(expressSession)

passport.use(new LocalStrategy({
    usernameField: 'login',
    passwordField: 'pass',
  },
  (login, pass, done) => {
    UserModel.findOne({ login: login }, async (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'INCORRECT_USERNAME' });
      }
      if (!await bcrypt.compare(pass, user.pass)) {
        return done(null, false, { message: 'INCORRECT_PASSWORD' });
      }
      return done(null, user);
    });
  }
));

passport.use(new GoogleStrategy({
    clientID: GOOGLE_OAUTH_KEY,
    clientSecret: GOOGLE_OAUTH_SECRET,
    callbackURL: RootUri + "/auth/google/callback",
  },
  async (token, tokenSecret, profile, done) => {
    // console.log('profile', profile);
    const email = profile.emails?.[0].value;
    if(!email) {
      return done(new Error('Got no e-mail data'));
    }
    const existingUser = await UserModel.findOne({ login: email });
    if(existingUser) {
      return done(undefined, existingUser);
    }
    // TODO: generate a valid alias
    let newUser = new UserModel({
      login: email,
      name: profile.displayName,
      authProvider: 'google',
      emailVerified: true,
    });
    await generateAlias(newUser);
    newUser = await newUser.save();

    const photoUrl = profile.photos?.[0].value;
    if(photoUrl) {
      const photoResponse = await fetch(photoUrl);
      const photoData = await photoResponse.buffer();
      const fname = await updateUserAvatar(newUser.id, photoData);
      newUser.avatar = fname;
      newUser = await newUser.save();
    }

    return done(undefined, newUser);
  }
));

const postSigninHooks = async (req : Request, res : Response, user : IUser) => {
  // Note: this is triggered on every OAuth sign-in
  if('inviteKey' in req.cookies) {
    const key = req.cookies.inviteKey;
    const invite = await TeamInviteModel.findOne({ key });
    console.log('key', key, 'invite', invite)
    if(invite) {
      const { err, team } = await executeInvite(user, invite);
      console.log('team', team)
      if(err)
        console.warn(err);
    }
    res.clearCookie('inviteKey');
  }
};

const generateAlias = async (user : IUser) => {
  let alias = user.login.split('@')[0];
  // Try e-mail login as an alias
  if((await UserModel.countDocuments({ alias })) < 1) {
    user.alias = alias;
    return;
  }
  // Prepend a random number
  alias = `${alias}.${Math.floor(Math.random() * 1000).toString()}`;
  if((await UserModel.countDocuments({ alias })) < 1) {
    user.alias = alias;
    return;
  }
  // Go rough - pray this one isn't taken
  alias = randomStr(8);
  user.alias = alias;
}

passport.serializeUser((user : IUser, done) => {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  UserModel.findOne({ _id : id as string }, (err, user) => {
    done(null, user);
  });
});

export const sendActivationEmail = async (user : IUser) => {
  const confirmation = new ConfirmationModel({
    user,
    action: 'account/activate',
    key: randomStr(32),
    validUntil: Date.now() + 86000000,
  });
  await confirmation.save();

  const confirmLink = `${RootUri}/confirm/${confirmation.key}`;

  const sendRes = await sendEmailTemplate(
    user.login,
    `Welcome to Tests`,
    'accountActivation',
    { confirmLink }
  );
  return sendRes;
}

export const registerAuthHandlers = (server : Express) => {
  // Setup session store in Mongo
  const sessionStore = new MongoStore({
    url: MongoUri,
    collection: 'websessions'
  });
  const sessionSecret = '9824nc*&CH2d98qJWbvxcV';
  server.use(expressSession({
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    secret: sessionSecret,
    cookie: { maxAge: 86400000 * 30 }
  }))
  server.use(passport.initialize());
  server.use(passport.session());


  server.post('/register', async (req, res, next) => {
    const login = req.body.login;
    const pass = req.body.pass;
    const userExists = (await UserModel.countDocuments({ login: login })) > 0;
    if(userExists) {
      res.send({
        authed: false,
        error: 'exists',
      });
      return;
    }
    if(!PasswordPattern.test(pass)) {
      res.json({
        authed: false,
        error: 'PASSWORD_DOESNT_MATCH_PATTERN',
      });
      return;
    }

    // TODO: check login/password format

    const encryptedPass = await bcrypt.hash(pass, 8);
    // TODO: generate a valid alias
    const newUser = new UserModel({
      login,
      pass: encryptedPass,
    });
    await generateAlias(newUser);
    await newUser.save();

    await postSigninHooks(req, res, newUser);

    syncActiveCampaignContactQueue.add({ user: newUser });

    await sendActivationEmail(newUser);

    req.login(newUser, (err) => {
      if (err) {
        res.json({
          authed: false,
          error: err,
        });
      }
      res.json({ authed: true });
    });
  });

  server.post('/login', async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if(err) {
        res.json({ authed: false, error: err });
        return;
      }
      if(!user) {
          res.json({ authed: false, error: info.message });
          return;
      }
      req.login(user, async (err) => {
        if (err) {
            res.json({
              authed: false,
              error: err
            });
            return;
        }

        await postSigninHooks(req, res, user);
        res.json({ authed: true });
      })
    })(req, res, next);
  });

  server.post('/resetPassword', async (req, res, next) => {
    const key = req.body.key;
    const newPassword = req.body.newPassword;

    if(!PasswordPattern.test(newPassword)) {
      res.json({
        authed: false,
        error: 'PASSWORD_DOESNT_MATCH_PATTERN',
      });
      return;
    }

    const confirmation = await ConfirmationModel.findOne({ key, action: 'account/resetPassword' });
    if(!confirmation || confirmation.validUntil < Date.now()) {
      res.status(403).send('This confirmation link has expired');
      return;
    }

    const user = await UserModel.findOne({ _id : confirmation.user });
    if(!user) {
      res.status(402).send('User not found');
      return;
    }

    const encryptedPass = await bcrypt.hash(newPassword, 8);
    user.pass = encryptedPass;
    await user.save();

    await postSigninHooks(req, res, user);

    const sendRes = await sendEmailTemplate(
      user.login,
      `Your Tests password has been changed`,
      'passwordChanged',
      { name: user.name }
    );

    req.login(user, (err) => {
      if (err) {
        res.json({
          authed: false,
          error: err,
        });
      }
      res.json({ authed: true });
    });
  });

  server.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
  });

  server.get('/auth/google',
    passport.authenticate('google', { scope: [ 'openid', 'email', 'profile' ] }));

  server.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
      const user = (req.user as IUser);
      await postSigninHooks(req, res, user);

      syncActiveCampaignContactQueue.add({ user: user });

      const alias = user?.alias;
      if(user?.skillArea)
        res.redirect('/dashboard');
      else
        res.redirect('/finishSignup');
    }
  );

  server.get('/', async (req, res) => {
    res.redirect('/login');
  });


  // Temporary stats reporting
  server.get('/stats', async (req, res) => {
    if(req.query.key !== 'fh&CEw03d28cdkS92d') {
      res.status(403).send({});
      return;
    }

    const stats = {
      users: await UserModel.countDocuments({}),
      skills: await UserSkillModel.countDocuments({}),
      teams: await TeamModel.countDocuments({}),
      projects: await ProjectModel.countDocuments({}),
    };
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(stats, null, 2));
  });
};
