"use strict";

const debug = require("debug")("hangman:global");

before(function (done) {
  debug("flushing cache");
  require("../../src/config/redis.js")
    .flushdbAsync()
    .then(() => done());
});

after(function (done) {
  debug("closing database ...");
  require("../../src/config/redis.js").quit();
  require("../../src/config/mongoose.js").then((mongoose) =>
    mongoose.disconnect(done)
  );
});
