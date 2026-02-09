import { Server as Socket } from 'socket.io';
import application from './app.js';
import cookieParser from 'cookie-parser';
import createChatClient from './realtime/chat.js';
import createRealTimeServer from './realtime/games.js';
import dbProvider from './config/mongoose.js';
import debug from 'debug';
import gameService from './services/games.js';
import http from 'http';
import { createAdapter as redisAdapter } from '@socket.io/redis-adapter';
import redisClient from './config/redis.js';
import userService from './services/users.js';
import users from './middleware/users.js';

const { promise, resolve, reject } = Promise.withResolvers();

let server;

dbProvider
  .then((db) => {
    application(db).then((app) => {
      server = http.createServer(app);

      server.on('close', () => {
        redisClient.then((rd) => {
          rd.destroy();
        });
        db.disconnect();
      });

      let io = new Socket(server);

      io.use(adapt(cookieParser()));

      userService
        .then((us) => {
          io.use(adapt(users(us)));
        })
        .catch((err) => {
          reject(err);
        });

      gameService(db)
        .then((gs) => {
          createRealTimeServer(io, gs);
        })
        .catch((err) => {
          reject(err);
        });

      createChatClient(io);

      if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
        redisClient.then((rd) => {
          const subClient = rd.duplicate();
          // subClient.connect();
          // io.adapter(redisAdapter(redisClient, subClient));
        });
      }

      resolve(server);
    });
  })
  .catch((err) => {
    reject(err);
  });

export default promise;

// Shim to make Express middleware work with Socket IO.
function adapt(expressMiddleware) {
  return (socket, next) => {
    expressMiddleware(socket.request, socket.request.res, next);
  };
}
