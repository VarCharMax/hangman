import gulp from 'gulp';
import mocha from 'gulp-mocha';
import appServer from '../src/server.js';

const integration_test = (done) => {
  const TEST_PORT = 5000;

  // Launch application before test
  appServer.then((sv) => {
    sv.listen(TEST_PORT);
    sv.on('error', (error) => sv.close(() => done(error))).on('listening', () => {
      return gulp.src('integration-test/**/*.js').pipe(
        mocha().on('end', () => {
          sv.close();
          done();
        })
      );
    });
  });
};

export { integration_test };
