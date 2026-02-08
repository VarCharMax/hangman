import { createAdapter as redisAdapter } from '@socket.io/redis-adapter';
import cookieParser from 'cookie-parser';
import debug from 'debug';
import http from 'http';
import { Server as Socket } from 'socket.io';
import application from './app.js';
import dbProvider from './config/mongoose.js';
import { redisClient } from './config/redis.js';
import users from './middleware/users.js';
import createChatClient from './realtime/chat.js';
import realtimeGames from './realtime/games.js';
import { gameService } from './services/games.js';
import { userService } from './services/users.js';

const serverdebug = debug('hangman:db');
const { promise, resolve, reject } = Promise.withResolvers();

export default dbProvider
  .then((db) => {
    serverdebug('Server starting ...');
    application(db)
      .then(async (app) => {
        const server = http.createServer(app);

        server.on('close', () => {
          redisClient.destroy();
          db.disconnect();
        });

        // Chat connectivity.
        let io = new Socket(server);

        io.use(adapt(cookieParser()));
        io.use(adapt(users(userService)));

        // Federated io via redis server.
        // Don't configure redis federation in test scenarios.
        if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
          if (redisClient) {
            const subClient = redisClient.duplicate();
            await subClient.connect();
            io.adapter(redisAdapter(redisClient, subClient));
          }
        }

        createChatClient(io);
        realtimeGames(io, gameService);

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

// Shim to make Express middleware work with Socket IO.
function adapt(expressMiddleware) {
  return (socket, next) => {
    expressMiddleware(socket.request, socket.request.res, next);
  };
}
