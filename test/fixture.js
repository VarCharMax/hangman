import { createMongodbClient, mongod } from '../src/config/mongoose.js';

import { createRedisClient } from '../src/config/redis.js';
import debug from 'debug';

const testdebug = debug('hangman:test');

export async function mochaGlobalSetup() {
  testdebug('Setup ...');
  if (mongod) {
    await mongod.stop();
  }
  createRedisClient().then(async (rd) => {
    testdebug('Flushing redis mock db ...');
    await rd.flushDb();
  });
}

export async function mochaGlobalTeardown() {
  testdebug('Teardown');
  createRedisClient().then(async (rd) => {
    testdebug('Destroying redis connection ...');
    await rd.destroy();
  });

  createMongodbClient().then(async (db) => {
    testdebug('Disconnecting mongodb connection ...');
    db.connection.db.dropDatabase();
    await db.disconnect();
    testdebug('Stopping mock server ...');
    await mongod.stop();
  });
}
