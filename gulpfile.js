import {
  lint_client,
  lint_integration_test,
  lint_server,
  lint_test,
} from './tasks/lint_tests.js';
import { parallel, series } from 'gulp';

import { integration_test } from './tasks/integration_tests.js';
import { mocha_unit_tests } from './tasks/mocha_unit_tests.js';
import { unit_tests } from './tasks/unit_tests.js';

const lint = parallel(lint_server, lint_client, lint_test, lint_integration_test);

export default series(lint, unit_tests);
export { integration_test };
