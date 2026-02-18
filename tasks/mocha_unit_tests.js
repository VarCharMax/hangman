import dotenv from 'dotenv';
import gulp from 'gulp';
import mocha from 'gulp-mocha';

dotenv.config({ path: './.test_env', override: true });

const mocha_unit_tests = function (done) {
  return gulp
    .src(['test/**/*.js'], { read: false })
    .pipe(mocha({ require: './test/fixture.js', timeout: 60000 }))
    .on('error', console.error)
    .once('end', function () {
      done();
      process.exit(); // Explicitly exit after the 'end' event
    });
};

export { mocha_unit_tests };
