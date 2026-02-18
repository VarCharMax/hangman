import { createAdapter as redisAdapter } from '@socket.io/redis-adapter';
import cookieParser from 'cookie-parser';
import debug from 'debug';
import http from 'http';
import { Server as Socket } from 'socket.io';
import { Application } from './app.js';
import { mongodbClient } from './config/mongoose.js';
import { redisClient } from './config/redis.js';
import usersMW from './middleware/users.js';
import createChatServer from './realtime/chat.js';
import createGameServer from './realtime/games.js';
import { gameService } from './services/games.js';
import { userService } from './services/users.js';

const { promise, resolve, reject } = Promise.withResolvers();

export function appServer() {
  const serverdebug = debug('hangman:server');

  mongodbClient()
    .then((db) => {
      Application(db).then((app) => {
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
}
