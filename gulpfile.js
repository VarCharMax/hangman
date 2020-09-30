"use strict";

const gulp = require("gulp");
const eslint = require("gulp-eslint");
const shell = require("gulp-shell");
const mocha = require("gulp-mocha");
const env = require("gulp-env");
// const cover = require("gulp-coverage");
// const coveralls = require("gulp-coveralls");
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

  let server = require("http")
    .createServer(require("./src/app.js"))
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
        .on("error", () => server.close(done))
        .on("end", () => server.close(done));
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
  env({ vars: { NODE_ENV: "test" } });

  return (
    gulp
      .src("test/**/*.js", { read: false })
      //.pipe(
      //  cover.instrument({
      //    pattern: ["src/**/*.js"],
      //    debugDirectory: "debug/info",
      //  })
      //)
      .pipe(mocha())
  );
  //.pipe(
  //  cover.report({
  //    reporter: "json",
  //    outFile: "testoutput.json",
  //  })
  //);
  //.pipe(cover.gather())
  //.pipe(cover.format({ reporter: "lcov", outputFile: "test.html" }))
  //.pipe(gulp.dest("/c/dev/node"));
  //.pipe(coveralls())
}

exports.integration_test = integration_test;

exports.default = series(
  parallel(lint_server, lint_client, lint_integration_test),
  series(lint_test, test)
);
