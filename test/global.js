/* eslint-disable no-undef */

import mongooseServer, { mongod } from '../src/config/mongoose.js';

import redisClient from '../src/config/redis.js';

before(function (done) {
  redisClient().then((rd) => {
    rd.flushDb().then(() => done());
  });
  mongooseServer().then((db) => {
    db.connection.db.dropDatabase();
  });
});

after(function (done) {
  redisClient().then((rd) => {
    rd.destroy();
  });

  mongooseServer().then((db) => {
    db.disconnect().then(() => {
      mongod.stop();
    });
    done();
  });
});
