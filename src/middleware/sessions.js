import { getNamedExport } from './../lib/libraries.js';
import session from 'express-session';

const expressSession = (redis) => {
  let config = {
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false
  };

  if (redis) {
    getNamedExport('RedisStore', 'connect-redis').then((redisStore) => {
      config.store = new redisStore({ client: redis });
    });
  }

  return session(config); //OK
};

export function sessionAdapter(passport, redis) {
  return [expressSession(redis), passport.initialize(), passport.session()];
}
