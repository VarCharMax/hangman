import { getNamedExport } from './../lib/libraries.js';
import session from 'express-session';

const expressSession = function Session() {
  let config = {
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  };

  if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
    const RedisStore = getNamedExport('RedisStore', 'connect-redis');
    const redisStore = RedisStore(session);
    config.store = new redisStore({ url: process.env.REDIS_URL });
  }
  return session(config);
};

export default (passport) => [
  expressSession(),
  passport.initialize(),
  passport.session(),
];
