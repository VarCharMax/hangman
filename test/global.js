/* eslint-disable no-undef */

import { mongod, mongodbClient } from '../src/config/mongoose.js';

import { redisClient } from '../src/config/redis.js';

before(function (done) {
  if (mongod) {
    mongod.stop();
  }
  redisClient().then((rd) => {
    rd.flushDb().then(() => done());
  });
  mongodbClient().then((db) => {
    db.connection.db.dropDatabase();
  });
});

after(function (done) {
  redisClient().then((rd) => {
    rd.destroy();
  });

  mongodbClient().then((db) => {
    db.disconnect().then(() => {
      mongod.stop();
    });
    done();
  });
});
