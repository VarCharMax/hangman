"use strict";

const debug = require("debug")("hangman:global");

before(function (done) {
  require("../src/config/redis.js")
    .flushdbAsync()
    .then(() => done());
});

after(function (done) {
  debug("ending");
  require("../src/config/redis.js").quit();
  require("../src/config/mongoose.js").default.then((mongoose) =>
    mongoose.disconnect(done)
  );
});
