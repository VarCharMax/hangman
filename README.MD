# Hangman

Classic Hangman game implemented in Node.js, Express front-end, MongoDB backend, Redis real-time scoring, Mocha unit tests.

Based on code from a fairly old Node.js book by Harry Cummings.

The main things I have done are:

- converted the code base to ES6 modules.
- replaced obsolete packages. Specifically:
  - Bluebird. (Promisify lib no longer needed - all newer libraries are async.)
  - Istanbul. (Replaced by nyc.)
  - Mockgoose. (Replaced by mongodb-memory-server.)
  - Phantomjs.

It isn't completely functional just yet, but compiles and will run.
Main issues

- one redis function isn't working.
- tests were working but somehow have become broken after new functionality added. Since Mocha won't load them, it feels lie a syntax error somewhre, but nothing is getting flagged.
