import gulp, { parallel, series } from 'gulp';

import globals from 'globals';
import eslint from 'gulp-eslint-new';
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
  server.then((sv) => {
    sv.listen(TEST_PORT);
    sv.on('listening', onListening.bind(sv));
    sv.on('error', (error) => server.close(() => done(error))).on('listening', () => {
      return gulp.src('integration-test/**/*.js', { read: false }).pipe(
        mocha().on('end', () => {
          sv.close();
          done();
        })
      );
    });
  });

  function onListening() {
    var addr = this.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  }
};

const tests = () => {
  return run(
    'npx cross-env NODE_ENV=test nyc --clean --check-coverage --lines 90 --statements 70 --branches 50 mocha --timeout 30000  --colors test/**/*.js'
  ).exec();
};

const lint = parallel(lint_server, lint_client, lint_test, lint_integration_test);

export default series(lint, tests);

export { integration_test };
