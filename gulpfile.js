"use strict";

const gulp = require("gulp");
const eslint = require("gulp-eslint");
const shell = require("gulp-shell");
const run = require("gulp-run");
const { series, parallel } = require("gulp");

function lint_server() {
  return gulp
    .src(["src/**/*.js", "!src/public/**/*.js", "!src/node_modules/**"])
    .pipe(
      eslint({
        envs: ["es6", "node"],
        rules: {
          "no-unused-vars": [2, { argsIgnorePattern: "next" }],
        },
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function lint_client() {
  return gulp
    .src("src/public/**/*.js")
    .pipe(eslint({ envs: ["browser", "jquery"] }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function lint_test() {
  return gulp
    .src("test/**/*.js")
    .pipe(eslint({ envs: ["es6", "node", "mocha"] }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function integration_test(done) {
  const TEST_PORT = 5000;

  require("./src/config/mongoose.js").then((mongoose) => {
    let server,
      teardown = (error) => {
        require("./src/config/redis.js").quit();
        server.close(() => mongoose.disconnect(() => done(error)));
      };
    server = require("http")
      .createServer(require("./src/app.js")(mongoose))
      .listen(TEST_PORT, function () {
        gulp
          .src("integration-test/**/*.js")
          .pipe(
            shell(
              "node node_modules/phantomjs-prebuilt/bin/phantomjs <%=file.path%>",
              {
                env: { TEST_PORT: TEST_PORT },
              }
            )
          )
          .on("error", teardown)
          .on("end", teardown);
      });
  });
}

function lint_integration_test() {
  return gulp
    .src("integration-test/**/*.js")
    .pipe(
      eslint({
        envs: ["browser", "phantomjs", "jquery"],
        rules: { "no-console": 0 },
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function test() {
  return run("npx cross-env NODE_ENV=test nyc mocha test/**/*.js").exec();
}

exports.integration_test = integration_test;
// exports.default = series(test);
exports.default = series(
  parallel(lint_server, lint_client, lint_integration_test),
  series(lint_test, test)
);
