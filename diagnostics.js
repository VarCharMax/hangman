import fs from 'fs';
import util from 'util';

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return; // Discard circular references
      }
      seen.add(value);
    }
    return value;
  };
};

const debug = function (...args) {
  fs.writeFileSync(1, `${util.format(...args)}\n`, { flag: 'a' });
};
const init = function (asyncId, type, triggerAsyncId, resource) {
  debug(
    `init: ${asyncId} - ${type} - ${JSON.stringify(resource, getCircularReplacer())}`
  );
};
const destroy = function (asyncId) {
  debug(`destroy: ${asyncId}`);
};

const before = function (asyncId) {
  debug(`before: ${asyncId}`);
};

const after = function (asyncId) {
  debug(`after: ${asyncId}`);
};

export { init, destroy, before, after };
