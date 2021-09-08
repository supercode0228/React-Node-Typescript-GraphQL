import path from 'path';

export const dev = process.env.NODE_ENV !== 'production';
type DeploymentType = 'local' | 'dev' | 'master';
export const deploymentType = (process.env.DEPLOYMENT_TYPE || 'local') as DeploymentType;

export const MountedDataPath = deploymentType === 'local' ? path.join(__dirname, '..', 'public', 'static') : '/usr/src/app/public/static';
export const EmailTemplatesPath = deploymentType === 'local' ? path.join(__dirname, '..', 'emails') : '/usr/src/app/emails';

export const RootUri = {
  'local': 'http://localhost:3000',
  'dev': 'https://staging.Tests.com',
  'master': 'https://app.Tests.com',
}[deploymentType];
export const CorsOrigins = [ 'http://localhost:3000/', 'https://staging.Tests.com', 'https://app.Tests.com' ];
export const MongoUri = 'mongodb://' + (deploymentType === 'local' ? 'localhost:27017' : 'ms-mongo') + '/Tests';
// export const GraphQLUri = `${RootUri}/graphql`;
export const redisURL = deploymentType === 'local' ? 'redis://127.0.0.1:6379' : 'redis://Tests-redis:6379'

export const ACTIVECAMPAIGN_ACCOUNT = process.env.ACTIVECAMPAIGN_ACCOUNT || '';
export const ACTIVECAMPAIGN_KEY = process.env.ACTIVECAMPAIGN_KEY || '';
export const ACTIVECAMPAIGN_TRACK_ACTID = process.env.ACTIVECAMPAIGN_TRACK_ACTID || '';
export const ACTIVECAMPAIGN_TRACK_KEY = process.env.ACTIVECAMPAIGN_TRACK_KEY || '';

export const GOOGLE_OAUTH_KEY = process.env.GOOGLE_OAUTH_KEY || '-';
export const GOOGLE_OAUTH_SECRET = process.env.GOOGLE_OAUTH_SECRET || '-';

export const AIRBRAKE_PROJECT_ID = process.env.AIRBRAKE_PROJECT_ID || '';
export const AIRBRAKE_PROJECT_KEY = process.env.AIRBRAKE_PROJECT_KEY || '';
export const AIRBRAKE_ENVIRONMENT = process.env.AIRBRAKE_ENVIRONMENT;

export const AWS_REGION = process.env.AWS_REGION || '-';
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || '-';
export const AWS_ACCESS_SECRET = process.env.AWS_ACCESS_SECRET || '-';

export const SuggestBlogsUrl = 'https://api.webflow.com/collections/5dc27bf9f6793948fc81df39/items?access_token=87179d20a450dba2d3c8c15387875577a216174dd7c010b8b1bcec3ee5575b99&api_version=1.0.0';
export const BlogBaseUrl = 'https://www.Tests.com/blog/';
