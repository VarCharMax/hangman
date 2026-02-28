import dotenv from 'dotenv';
import exit from 'gulp-exit';
import { getNamedExport } from './../src/lib/libraries.js';
import gulp from 'gulp';
import mocha from 'gulp-mocha';

const integration_test = async () => {
  const createAppServer = await getNamedExport('createAppServer', '../server.js'); //Path is relative to lib folder, not this script.

  createAppServer().then((sv) => {
    dotenv.config({ path: './env/.env.integration.test', override: true });

    sv.listen(process.env.TEST_PORT);
    sv.on('listening', onListening.bind(sv))
      .on('listening', () => {
        return gulp
          .src('integration-test/**/*.js', { read: false })
          .pipe(mocha({ timeout: 30000 }).on('end', () => sv.close()))
          .pipe(exit());
      })
      .on('error', () => sv.close());
  });

  function onListening() {
    var addr = this.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  }
};

export { integration_test };
