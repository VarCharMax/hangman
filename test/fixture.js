import { mongod, mongodbClient } from '../src/config/mongoose.js';

import debug from 'debug';
import { redisClient } from '../src/config/redis.js';

const testdebug = debug('hangman:test');

export async function mochaGlobalSetup() {
  testdebug('Setup ...');
  if (mongod) {
    mongod.stop();
  }
  redisClient().then(async (rd) => {
    await rd.flushDb();
  });
}

export async function mochaGlobalTeardown() {
  testdebug('Teardown');
  redisClient().then((rd) => {
    rd.destroy();
  });

  mongodbClient().then((db) => {
    db.disconnect().then(() => {
      mongod.stop();
    });
  });
}
