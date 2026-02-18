/* eslint-disable no-undef */

import { mongod, mongodbClient } from '../src/config/mongoose.js';

import { redisClient } from '../src/config/redis.js';

export async function mochaGlobalSetup() {
  console.log('Setup ...');
  if (mongod) {
    mongod.stop();
  }
  redisClient().then(async (rd) => {
    await rd.flushDb();
  });
  mongodbClient().then((db) => {
    db.connection.db.dropDatabase();
  });
}

export async function mochaGlobalTeardown() {
  console.log('Teardown');
  redisClient().then((rd) => {
    rd.destroy();
  });

  mongodbClient().then((db) => {
    db.disconnect().then(() => {
      mongod.stop();
    });
  });
}
