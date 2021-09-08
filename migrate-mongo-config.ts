/**
 * @format
 */

import { deploymentType } from './server/config';

export default {
  mongodb: {
    url:
      'mongodb://' +
      (deploymentType === 'local' ? 'localhost:27017' : 'ms-mongo'),
    databaseName: 'tests'
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.ts'
};
