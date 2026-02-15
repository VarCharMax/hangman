import { parallel, series } from 'gulp';
import {
  lint_client,
  lint_integration_test,
  lint_server,
  lint_test,
} from './gulp/lint_tests.js';

import { unit_tests } from './gulp/unit_tests.js';

// import { integration_test } from './gulp/integration_tests.js';

const lint = parallel(lint_server, lint_client, lint_test, lint_integration_test);

export default series(lint, unit_tests);

// export { integration_test };
