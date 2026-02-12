import gulp, { parallel, series } from 'gulp';

import globals from 'globals';
import eslint from 'gulp-eslint-new';
import run from 'gulp-run';

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

const test = () => {
  return run(
    'npx cross-env NODE_ENV=test nyc --clean --check-coverage --lines 90 --statements 70 --branches 50 mocha --timeout 30000 --exit --colors test/**/*.js'
  ).exec();
};

const lint = parallel(lint_server, lint_client, lint_test);

export default series(lint, test);
