import globals from 'globals';
import gulp from 'gulp';
import eslint from 'gulp-eslint-new';

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

export { lint_client, lint_integration_test, lint_server, lint_test };
