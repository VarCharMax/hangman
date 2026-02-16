import appServer from '../src/server.js';
import dotenv from 'dotenv';
import exit from 'gulp-exit';
import gulp from 'gulp';
import mocha from 'gulp-mocha';

dotenv.config({ path: './.test_env' });

const integration_test = (done) => {
  const TEST_PORT = process.env.TEST_PORT;

  // Launch application before test
  appServer.then((sv) => {
    sv.listen(TEST_PORT);
    sv.on('listening', onListening.bind(sv));
    sv.on('error', (error) => sv.close(() => done(error))).on('listening', () => {
      return gulp
        .src('integration-test/**/*.js', { read: false })
        .pipe(
          mocha({ timeout: 30000 }).on('end', () => {
            sv.close(done);
          })
        )
        .pipe(exit());
    });
  });

  function onListening() {
    var addr = this.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  }
};

export { integration_test };
