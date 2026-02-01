# Hangman

Classic Hangman game implemented in Node.js, Express front-end, MongoDB backend, Redis real-time scoring, Socket IO, Mocha unit tests.

Based on code from a fairly old Node.js book by Harry Cummings.

Even though the project is old, I thought it would be a useful exercise to upgrade it to the latest ES6 standards.

I made things a bit difficult for myself by insisting that all services had to be asynchronous. This requirement wasn't in the original book to a great extent, but I tend to think all services should be async by default. Anyway, don't say I'm not up for a challenge.

The downside is that Node.js probably wouldn't be the idea choice for this kind of application now.

The main things I have done are:

- converted the code base to ESM.
- replaced obsolete packages. Specifically:
  - Bluebird. (Promisify lib no longer needed - all newer libraries are async.)
  - Istanbul. (Replaced by nyc.)
  - Mockgoose. (Replaced by mongodb-memory-server.)
  - Phantomjs.

It isn't completely functional just yet, but compiles and will run.
Main issues

- one redis function isn't working. I think this is due to the async architecure, which is a bit complicated in this case.
- There was a problem with the tests, apparently due to ESM not working well with mocks with await:
  `Failed to run Mocha due to error message: " require() cannot be used on an ESM graph with top-level await.`
  The problem is I'm not the one using `require()`, so I couldn't address the problem directly. The await is being used in the mongoose mock library. I've worked around this by making both the live and mock implementations return the same Promise.
