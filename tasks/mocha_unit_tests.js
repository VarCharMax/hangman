import dotenv from 'dotenv';
import gulp from 'gulp';
import mocha from 'gulp-mocha';

dotenv.config({ path: './.test_env' });

const unit_tests = function (done) {
  return gulp
    .src(['test/**/*.js'], { read: false })
    .pipe(mocha({ reporter: 'list', exit: true }))
    .on('error', console.error)
    .once('end', function () {
      done();
      process.exit(); // Explicitly exit after the 'end' event
    });
};

export default unit_tests;
