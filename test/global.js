/* eslint-disable no-undef */

import mongoose, { devServer } from '../src/config/mongoose.js';

before(function () {
  // redisClient.flushdbAsync().then(done);
});

after(function (done) {
  // redisClient.quit();

  mongoose.then((mongoose) => {
    mongoose.disconnect();
    devServer.stop();
    done();
  });
});
