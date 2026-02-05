import debug from 'debug';
import http from 'http';
import application from './app.js';
import dbProvider from './config/mongoose.js';

// import { Server as sock } from 'socket.io';

const serverdebug = debug('hangman:server');
const { promise, resolve, reject } = Promise.withResolvers();

export default dbProvider
  .then((db) => {
    serverdebug('Server starting ...');
    let server = null;
    application(db).then((app) => {
      server = http.createServer(app);
      server.on('close', () => {
        // require('../src/config/redis.js').quit();
        db.disconnect();
      });
      resolve(server);
    });

    return promise;
  })
  .catch((err) => {
    serverdebug(`DB Error: ${err}`);
    process.exit(1);
  });

/*
function adapt(expressMiddleware) {
  return (socket, next) => {
    expressMiddleware(socket.request, socket.request.res, next);
  };

}
*/
