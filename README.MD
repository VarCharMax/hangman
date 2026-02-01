# Hangman

Classic Hangman game implemented in Node.js, Express front-end, MongoDB backend, Redis real-time scoring, Socket IO, Mocha unit tests.

Based on code from a fairly old Node.js book by Harry Cummings.

Even though the project is old, I thought it would be a useful exercise to upgrade it to the latest ES6 standards.

I made things a bit difficult for myself by insisting that all services had to be asynchronous. This requirement wasn't in the original book to a great extent, but I tend to think all services should be async by default. Anyway, don't say I'm not up for a challenge.

The downside is that Node.js probably wouldn't be the idea choice for this kind of application now.

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
- tests were working but somehow have become broken after new functionality added. Since Mocha won't load them, it feels like a syntax error somewhere, but nothing is getting flagged.
