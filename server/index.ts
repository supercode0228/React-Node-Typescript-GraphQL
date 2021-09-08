import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import next from 'next';
import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { importSchema } from 'graphql-import';
import { buildSchema } from 'type-graphql';
import AWS from 'aws-sdk';
import 'reflect-metadata';
import { Notifier } from '@airbrake/node';

import { registerAuthHandlers } from './handlers/auth';
import { CorsOrigins, AIRBRAKE_PROJECT_ID, AIRBRAKE_PROJECT_KEY, AIRBRAKE_ENVIRONMENT, AWS_REGION, AWS_ACCESS_KEY, AWS_ACCESS_SECRET, deploymentType } from './config';
import { registerUploadHandlers } from './handlers/upload';
import { registerInviteHandlers } from './handlers/invite';
import { registerConfirmHandlers } from './handlers/confirm';
import { customAuthChecker } from './core/graphql/shared';

if (process.env.NODE_ENV === 'production') {
  new Notifier({
    projectId: parseInt(AIRBRAKE_PROJECT_ID),
    projectKey: AIRBRAKE_PROJECT_KEY,
    environment: AIRBRAKE_ENVIRONMENT
  });
}

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Setup AWS API access
AWS.config = new AWS.Config();
AWS.config.accessKeyId = AWS_ACCESS_KEY;
AWS.config.secretAccessKey = AWS_ACCESS_SECRET;
AWS.config.region = AWS_REGION;

app.prepare().then(async () => {
  const server = express();

  server.use(cookieParser());
  server.use(bodyParser.json({ limit: '10mb' }));
  server.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
  }));

  registerAuthHandlers(server);
  registerUploadHandlers(server);
  registerInviteHandlers(server);
  registerConfirmHandlers(server);

  const schema = await buildSchema({
    resolvers: [ __dirname + "/core/graphql/**/*.resolver.{ts,js}" ],
    authChecker: customAuthChecker,
    emitSchemaFile: {
      path: __dirname + "/core/graphql/schema.gql",
      commentDescriptions: true,
    },
  });

  const apollo = new ApolloServer({
    schema,
    playground: dev ? { settings: { 'request.credentials': 'include' } } : false,
    introspection: true,
    tracing: true,
    context: ({ req }) => {
      return ({
        user: req.user,
      });
    }
  });
  apollo.applyMiddleware({
    app: server,
    path: '/graphql',
    cors: {
      origin: CorsOrigins,
      methods: "GET,POST",
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    },
    // bodyParserConfig: true,
    onHealthCheck: () =>
      // eslint-disable-next-line no-undef
      new Promise((resolve, reject) => {
          if (mongoose.connection.readyState > 0) {
              resolve();
          } else {
              reject();
          }
      }),
  });

  // Setup indexing policy
  server.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    // Allow everything in production and block everything in all the other cases
    if(deploymentType === 'master')
      res.send("User-agent: *\nDisallow:");
    else
      res.send("User-agent: *\nDisallow: /");
  });

  // Avoid Next.js's weird caching of avatar pictures
  server.use(express.static('public'));

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
})
