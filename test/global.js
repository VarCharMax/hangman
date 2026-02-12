/* eslint-disable no-undef */

import mongoose, { devServer } from '../src/config/mongoose.js';

import redisClient from '../src/config/redis.js';

before(function () {
  redisClient.then((rd) => {
    rd.flushDb().then(() => done());
  });
});

after(function (done) {
  redisClient.then((rd) => {
    rd.destroy();
  });

  mongoose
    .then((mongoose) => {
      mongoose.disconnect().then(() => {
        devServer.stop().then(() => {
          done();
        });
      });
    })
    .catch(() => {
      done();
    });
});
