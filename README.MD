# Hangman

Classic Hangman game implemented in Node.js, Express front-end, MongoDB backend, Redis real-time scoring, Socket IO, Mocha unit tests.

Based on code from a fairly old Node.js book by Harry Cummings.

Even though the project is old, I thought it would be a useful exercise to upgrade it to ES6 module (ESM) standards.

A few hurdles:

- Despite being available for 10 years, ESM still isn't widely used in Node.js projects. It took me a while to realise this, and I had been wondering why all code examples I saw on NPM were in CommonJS syntax. So it was bit bit of an adventure, and it tuned out there was one gotcha related to this issue (see below).
- The only real advantage to ESM I can see, apart from a slightly cooler syntax, is that it can load modules asynchronously. But CommonJS has other advantages - it can conditionally include, and include and instantiate in one call.
- Node.js probably wouldn't be the ideal choice for this kind of application now.

The main things I have done:

- converted the received code base to ESM.
- replaced obsolete packages. Specifically:
  - Bluebird. (Promisify library no longer needed - all new 3rd-party libraries are async.)
  - Istanbul. (Replaced by nyc.)
  - Mockgoose. (Replaced by mongodb-memory-server.)
  - Phantomjs.
- implemented all services asynchronously.

The latter requirement wasn't in the original book to a great extent, but I tend to think all services should be async by default. Anyway, don't say I'm not up for a challenge.

It isn't completely functional just yet, but compiles and will run.

Main issues:

- One redis function isn't working (`topPlayers()`). Because it's saying the `zrevrange()` method doesn't exist when it clearly does, I think this might be due to the async architecure it's embedded in, which is a bit complicated in this case.
- There was a problem with the tests, due to ESM not working well with mocks using await (see above):
  `Failed to run Mocha due to error message: "require() cannot be used on an ESM graph with top-level await.`
  The problem was I'm not the one using `require()`, so I couldn't address the problem directly. `await` is being used quite reasonably in the `mongoose` mock code. I've worked around this by making both the live and mock implementations return the same Promise.
- One middleware test is still failing (hopefully trivial).
