import { Server as Socket } from 'socket.io';
import application from './app.js';
import cookieParser from 'cookie-parser';
import createChatServer from './realtime/chat.js';
import createGameServer from './realtime/games.js';
import dbProvider from './config/mongoose.js';
import debug from 'debug';
import gameService from './services/games.js';
import http from 'http';
import { createAdapter as redisAdapter } from '@socket.io/redis-adapter';
import redisClient from './config/redis.js';
import userService from './services/users.js';
import usersMW from './middleware/users.js';

const appServer = () => {
  const { promise, resolve, reject } = Promise.withResolvers();
  const serverdebug = debug('hangman:server');

  dbProvider()
    .then((db) => {
      application(db).then((app) => {
        serverdebug('Server starting ...');

        const server = http.createServer(app);
        const io = new Socket(server);

        // Create federated io server using Redis.
        if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
          redisClient().then(async (rd) => {
            const subClient = rd.duplicate();
            await subClient.connect();
            io.adapter(redisAdapter(rd, subClient));
          });
        }

        // Wire up Socket to existing middlware.
        io.engine.use(cookieParser());

        userService()
          .then((us) => {
            io.engine.use(usersMW(us));
          })
          .catch((err) => {
            reject(err);
          });

        // Create users chat client.
        createChatServer(io);

        // Create game communication service.
        gameService(db)
          .then((gs) => {
            createGameServer(io, gs);
          })
          .catch((err) => {
            reject(err);
          });

        server.on('close', async () => {
          redisClient.then((rd) => {
            rd.destroy();
          });
          io.disconnectSockets();
          await db.disconnect();
        });
        resolve(server);
      });
    })
    .catch((err) => {
      serverdebug(`DB Error: ${err}`);
      reject(err);
    });

  return promise;
};

export default appServer;
