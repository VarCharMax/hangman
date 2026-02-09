# Hangman

Classic Hangman game implemented in Node.js, Express front-end, MongoDB backend, Redis real-time scoring, Socket IO, Mocha unit tests.

Based on code from a fairly old Node.js book by Harry Cummings.

Even though the project is old, I thought it would be a useful exercise to upgrade it to ES6 module (ESM) standards.

A few hurdles:

- I'm not sure that converting the codebase to ESM was such a great idea.
  - Despite being available for 10 years, ESM still isn't widely used in Node.js projects. It took me a while to realise this, and I had been wondering why all code examples I saw on NPM were in CommonJS syntax. So it was bit bit of an adventure, and it tuned out there was one gotcha related to this issue (see below).
  - The only real advantage to ESM I can see, apart from a slightly cooler syntax, is that it can load modules asynchronously. But CommonJS has other advantages - it can conditionally include, and include and instantiate in the one call.
- Node.js probably wouldn't be the ideal choice for this kind of application now.

The main things I have done:

- converted the received code base to ESM.
- replaced obsolete packages. Specifically:
  - Bluebird. (Promisify library no longer needed - all new 3rd-party libraries are async.)
  - Istanbul. (Replaced by nyc.)
  - Mockgoose. (Replaced by mongodb-memory-server.)
  - Phantomjs. (Puppeteer.)
  - Fixed a number of outright mistakes in the code base and improved the interface experience.
  - implemented all services asynchronously.

The latter requirement wasn't in the original book to a great extent, but I tend to think all services should be async by default. One or two of the services didn't really need to be implemented with callbacks, but I like the coding style, and it makes it more uniform. Anyway, don't say I'm not up for a challenge.

Main issues:

- Have just discovered that the redis-mock library is not asynchronous, which is why methods like `getTopPlayers()` have been crashing in dev. I had to write a wrapper for it to rig up async method mocks.
- There was a problem with the tests, due to ESM not working well with mocks using await (see above):
  `Failed to run Mocha due to error message: "require() cannot be used on an ESM graph with top-level await.`
  The problem is I'm not the one using `require()`, so I couldn't address the problem directly. `await` is being used quite reasonably in the `mongoose` mock code. I've worked around this by making both the live and mock implementations return the same Promise.
- Unit tests are all working. Had to increase hook timeout. Important to call `.stop()` on mongo test server - that's why the tests were hanging at one point. Also, `mondodb.disconnect()` no longer supports a callback.

## TODO

- DB implementation isn't fully DI - I'm calling library-specific methods in native code. Methods should be wrapped in order to isolate database implementation from calling code.
