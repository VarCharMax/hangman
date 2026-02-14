import gulp, { parallel, series } from 'gulp';

import eslint from 'gulp-eslint-new';
import exit from 'gulp-exit';
import globals from 'globals';
import mocha from 'gulp-mocha';
import run from 'gulp-run';
import server from './src/server.js';

const lint_server = () => {
  return gulp
    .src(['src/**/*.js', '!src/public/**/*.js'])
    .pipe(
      eslint({
        fix: true,
        overrideConfig: [
          {
            languageOptions: {
              globals: {
                ...globals.node,
              },
            },
            rules: {
              'no-unused-vars': [2, { argsIgnorePattern: 'next' }],
            },
          },
        ],
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.fix())
    .pipe(eslint.failAfterError());
};

const lint_client = () => {
  return gulp
    .src('src/public/**/*.js')
    .pipe(
      eslint({
        fix: true,
        overrideConfig: [
          {
            languageOptions: {
              globals: {
                ...globals.browser,
                ...globals.jquery,
                io: false,
              },
            },
          },
        ],
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.fix())
    .pipe(eslint.failAfterError());
};

const lint_test = () => {
  return gulp
    .src('test/**/*.js')
    .pipe(
      eslint({
        fix: true,
        overrideConfig: [
          {
            linterOptions: {
              reportUnusedDisableDirectives: 'off',
            },
            languageOptions: {
              globals: {
                ...globals.node,
                ...globals.mocha,
              },
            },
          },
        ],
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.fix())
    .pipe(eslint.failAfterError());
};

// eslint-disable-next-line no-unused-vars
const lint_integration_test = () => {
  return gulp
    .src('integration-test/**/*.js')
    .pipe(
      eslint({
        fix: true,
        overrideConfig: [
          {
            languageOptions: {
              globals: {
                ...globals.browser,
                ...globals.jquery,
              },
            },
            rules: {
              'no-console': 0,
            },
          },
        ],
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.fix())
    .pipe(eslint.failAfterError());
};

const integration_test = (done) => {
  const TEST_PORT = 5000;

  // Launch application befire test
  server.then((server) => {
    server.listen(TEST_PORT);
    server
      .on('error', (error) => server.close(() => done(error)))
      .on('listening', () => {
        return gulp
          .src('integration-test/**/*.js', { read: false })
          .pipe(
            mocha().on('end', () => {
              server.close();
              done();
            })
          )
          .pipe(exit());
      });
  });
};

const test = () => {
  return run(
    'npx cross-env NODE_ENV=test nyc --clean --check-coverage --lines 90 --statements 70 --branches 50 mocha --timeout 30000 --exit --colors test/**/*.js'
  ).exec();
};

const mocha_tests = (done) => {
  return gulp
    .src('test/**/*.js', { read: false })
    .pipe(
      mocha({ timeout: 10000 }).on('end', () => {
        done();
      })
    )
    .pipe(exit());
};

const lint = parallel(lint_server, lint_client, lint_test, lint_integration_test);

export default series(lint, test, integration_test);
