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
