import { Server as Socket } from 'socket.io';
import application from './app.js';
import createChatClient from './realltime/chat.js';
import dbProvider from './config/mongoose.js';
import debug from 'debug';
import http from 'http';
import { createAdapter as redisAdapter } from '@socket.io/redis-adapter';
import { redisClient } from './config/redis.js';

const serverdebug = debug('hangman:server');
const { promise, resolve, reject } = Promise.withResolvers();

export default dbProvider
  .then((db) => {
    serverdebug('Server starting ...');
    let server = null;
    application(db)
      .then(async (app) => {
        server = http.createServer(app);

        server.on('close', () => {
          redisClient.destroy();
          db.disconnect();
        });

        let io = new Socket(server);
        createChatClient(io);

        // Don't configure in test scenarios.
        if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
          if (redisClient) {
            const subClient = redisClient.duplicate();
            await subClient.connect();
            io.adapter(redisAdapter(redisClient, subClient));
          }
        }

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
