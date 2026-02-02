import debug from 'debug';
import http from 'http';
import application from './app.js';
import db from './config/mongoose.js';

// import { Server as sock } from 'socket.io';

const serverdebug = debug('hangman:server');

export default db
  .then((mongoose) => {
    serverdebug('Server starting ...');

    const app = application(mongoose);
    const server = http.createServer(app);

    //const io = sock(server);

    // chatServer(io);
    /*
  if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
    io.adapter(createAdapter(process.env.REDIS_URL));
  }
  */
    /*
  const usersService = require('./services/users.js');
  let passport = require('./config/passport')(usersService);
  require('./middleware/sessions')(passport).forEach((middleware) =>
    io.use(adapt(middleware))
  );


  require('./realtime/chat')(io);
  const gamesService = require('./services/games.js')(mongoose);
  require('./realtime/games')(io, gamesService);
  */

    server.on('close', () => {
      // require('../src/config/redis.js').quit();
      mongoose.disconnect();
    });

    return server;
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
