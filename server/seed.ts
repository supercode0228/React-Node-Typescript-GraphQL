/**
 * @format
 */

import { Seeder } from 'mongo-seeding';
import path from 'path';
import { dev, MongoUri } from './config';

if (!dev) {
  throw new Error('Database seeding is only availble in development.');
}

const config = {
  database: MongoUri,
  dropCollections: true
};

const seeder = new Seeder(config);
const collections = seeder.readCollectionsFromPath(
  path.join(__dirname, 'seeds'),
  {
    transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId]
  }
);

seeder
  .import(collections)
  .then(() => {
    console.log('Success');
  })
  .catch((error) => {
    console.log('Error', error);
  });
