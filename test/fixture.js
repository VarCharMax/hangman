import { mongod, mongodbClient } from '../src/config/mongoose.js';

import debug from 'debug';
import { redisClient } from '../src/config/redis.js';

const testdebug = debug('hangman:test');

export async function mochaGlobalSetup() {
  testdebug('Setup ...');
  if (mongod) {
    await mongod.stop();
  }
  redisClient().then(async (rd) => {
    testdebug('Flushing redis mock db ...');
    await rd.flushDb();
  });
}

export async function mochaGlobalTeardown() {
  testdebug('Teardown');
  redisClient().then(async (rd) => {
    testdebug('Destroying redis connection ...');
    await rd.destroy();
  });

  mongodbClient().then(async (db) => {
    testdebug('Disconnecting mongodb connection ...');
    db.connection.db.dropDatabase();
    await db.disconnect();
    testdebug('Stopping mock server ...');
    await mongod.stop();
  });
}
