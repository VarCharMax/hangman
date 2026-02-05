import debug from 'debug';
import http from 'http';
import { Server as Socket } from 'socket.io';
import application from './app.js';
import dbProvider from './config/mongoose.js';
import { redisClient } from './config/redis.js';
import createChatClient from './realltime/chat.js';

const serverdebug = debug('hangman:server');
const { promise, resolve, reject } = Promise.withResolvers();

export default dbProvider
  .then((db) => {
    serverdebug('Server starting ...');
    let server = null;
    application(db)
      .then((app) => {
        server = http.createServer(app);
        server.on('close', () => {
          redisClient.destroy();
          db.disconnect();
        });

        let io = new Socket(server);
        createChatClient(io);

        resolve(server);
      })
      .catch((err) => {
        serverdebug(`Application error: ${err}`);
        reject(err);
      });

    return promise;
  })
  .catch((err) => {
    serverdebug(`DB error: ${err}`);
    reject(err);
  });

/*
function adapt(expressMiddleware) {
  return (socket, next) => {
    expressMiddleware(socket.request, socket.request.res, next);
  };

}
*/
