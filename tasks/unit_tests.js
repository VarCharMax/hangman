import run from 'gulp-run';

const unit_tests = () => {
  return run(
    'npx cross-env NODE_ENV=test nyc --clean --check-coverage --lines 90 --statements 70 --branches 50 mocha --timeout 30000 --exit --colors test/**/*.js'
  ).exec();
};

export { unit_tests };
