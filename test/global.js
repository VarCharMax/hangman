/* eslint-disable no-undef */

import mongoose, { mongod } from '../src/config/mongoose.js';

import redisClient from '../src/config/redis.js';

before(function (done) {
  redisClient.then((rd) => {
    rd.flushDb().then(() => done());
  });
});

after(function (done) {
  redisClient.then((rd) => {
    rd.destroy();
  });

  mongoose.then((db) => {
    db.disconnect().then(() => {
      mongod.stop();
    });
    done();
  });
});
