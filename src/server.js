import { Application } from './app.js';
import { Server as Socket } from 'socket.io';
import createChatServer from './realtime/chat.js';
import createGameServer from './realtime/games.js';
import debug from 'debug';
import { gameService } from './services/games.js';
import http from 'http';
import { mongodbClient } from './config/mongoose.js';
import { passportClient } from './config/passport.js';
import { createAdapter as redisAdapter } from '@socket.io/redis-adapter';
import { redisClient } from './config/redis.js';
import { sessionAdapter } from './middleware/sessions.js';
import { usersService } from './services/users.js';

// import usersMW from './middleware/users.js';

const { promise, resolve, reject } = Promise.withResolvers();
const serverdebug = debug('hangman:server');

export function appServer() {
  mongodbClient()
    .then((db) => {
      Application(db).then((app) => {
        serverdebug('Server starting ...');

        const server = http.createServer(app);
        const io = new Socket(server);
        let redis = null;

        // Redis client used for federated io server and session storage.
        if (process.env.NODE_ENV !== 'test') {
          redisClient().then(async (rd) => {
            redis = rd;
            const subClient = rd.duplicate();
            await subClient.connect();
            io.adapter(redisAdapter(rd, subClient));
          });
        }

        usersService(redis)
          .then((us) => {
            let passport = new passportClient(us);
            new sessionAdapter(passport, redis).forEach((middleware) =>
              io.engine.use(middleware)
            );
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
