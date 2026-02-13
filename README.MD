# Hangman

Classic Hangman game implemented in Node.js

- Express mvc front-end.
- MongoDB backend.
- Redis real-time scoring.
- Chat server using Socket.IO
- Federated chat using Redis pub/sub.
- Linting via ESLint.
- Mocha unit tests.
- Coverage via nyc.
- Gulp test runner.

Based on code from a fairly old Node.js book by Harry Cummings.

Even though the project is old, I thought it would be a useful exercise to upgrade it to ES6 module (ESM) standards.

A few hurdles:

- I'm not sure that converting the codebase to ESM was such a great idea.
- Despite being available for 10 years, ESM still isn't widely used in Node.js projects. It took me a while to realise this, and I had been wondering why all code examples I saw on NPM were in CommonJS syntax. So it was bit bit of an adventure, and it tuned out there was one gotcha related to this issue (see below).
- From the point of view of Node.js, the only real advantage to ESM I can see, apart from a slightly cooler syntax, is that it can load modules asynchronously. But CommonJS has several advantages - it can conditionally include, and include and instantiate in the one call. However, if you want to write isomorphic modules, ESM is really the only choice now, given the obsolesence of RequireJS, so that makes a good case for it.
- Node.js probably isn't the ideal choice for this kind of application now. Despite a massive amount of work, the resulting interface is crude, and it isn't very robust. It's also wired up with a lot of jQuery, which is a fairly old approach now. (The author even suggests that Knockout would be a better tool.) However, the back end is very robust, and could still be used in a modern client-side implementation. The chat server is also good. It isn't implemented in WebSockets, though. I will look into re-implementing it, but the maintainers of the Socket.IO library say their technology has built-in features that you would have to create manually in Websockets.

The main things I have done:

- converted the received code base to ESM.
- replaced obsolete packages. Specifically:
  - Bluebird. (Promisify library no longer needed - all new 3rd-party libraries are async.)
  - Istanbul. (Replaced by nyc.)
  - Mockgoose. (Replaced by mongodb-memory-server.)
  - Phantomjs. (Puppeteer.)
  - RequireJS. (ESM.)
- Fixed a number of outright mistakes in the code base and improved the interface experience.
- Implemented all services asynchronously.

The latter requirement wasn't in the original book to a great extent, but I tend to think all services should be async by default. In Node.js, thanks to its non-blocking architecture, there is no overhead in implementing asychronous method calls. One or two of the services didn't really need to be implemented with callbacks, but I like the coding style, and it makes it more uniform. Also, Promises implement a psuedo-singleton pattern, which makes it easy to make sure there's only one point of entry to a service. Anyway, no one can say say I'm not up for a challenge - doing it this way required quite a lot of effort and ingenuity.

Main issues:

- Discovered that the redis-mock library is not asynchronous, and has a much older api than the current redis version, which is why methods like `getTopPlayers()` have been crashing in dev. I had to write a wrapper for it to rig up async method mocks and translate between method calls.
- There was a problem with the tests, due to ESM not working well with mocks using await (see above):
  `Failed to run Mocha due to error message: "require() cannot be used on an ESM graph with top-level await.`
  The problem is I'm not the one using `require()`, so I couldn't address the problem directly. `await` is being used quite reasonably in the `mongoose` mock code. I've worked around this by making both the live and mock implementations return the same Promise.
- Unit tests are all working. Had to increase hook timeout. Important to call `.stop()` on mongo test server - that's why the tests were hanging at one point. Also, `mondodb.disconnect()` no longer supports a callback. Even so, I found that they were still hanging when uploaded to Travis-CI. I concluded that this must be because they are being invoked by a test runner inside the gulp file, which spawns a new process. For some reason, this wasn't shutting down cleanly on the remote server. So the fix was just to add the dreaded --exit parameter. I occasioally see timeouts on Travis too, so I might have to increase the timeout.
- The source book, while full of great programming examples, and still worth reading, unfortunately seems to get sloppy in the later chapters, telling the reader to just look at the repository code rather than expecting an explanation. But some of the later code either doesn't work, or has outright mistakes. I've fixed all of these. The result is functionally identical to the book, and all the tests succeed.

## TODO

- DB implementation isn't fully DI - I'm calling library-specific methods in native code. Methods should be wrapped in order to isolate database implementation from calling code.
- Add improvements to interface. Should show win or lose based on number of tries. Add link back to homepage.
