import dotenv from 'dotenv';
import gulp from 'gulp';
import mocha from 'gulp-mocha';

dotenv.config({ path: './.test_env' });

const mocha_unit_tests = function (done) {
  return gulp
    .src(['test/services/games.js'], { read: false })
    .pipe(mocha({ require: './test/fixture.js', exit: true, timeout: 60000 }))
    .on('error', console.error)
    .once('end', function () {
      done();
      process.exit(); // Explicitly exit after the 'end' event
    });
};

export { mocha_unit_tests };
