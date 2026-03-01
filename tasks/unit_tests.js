import { dotEnvToString } from './../src/lib/libraries.js';
import dotenv from 'dotenv';
import run from 'gulp-run';

const envs = dotEnvToString(dotenv.config({ path: './env/.env.test' }));

const unit_tests = () => {
  return run(
    `npx cross-env ${envs} nyc --clean --check-coverage --lines 90 --statements 70 --branches 50 mocha --require './test/fixtures.js' --timeout 30000 --exit --colors test/routes/profile.js`
  ).exec();
};

export { unit_tests };
