import { RedisStore } from 'connect-redis';
import session from 'express-session';

// import { getNamedExport } from './../lib/libraries.js';


const expressSession = (redis) => {
  let config = {
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false
  };

  if (redis) {
    // const redisStore = await getNamedExport('RedisStore', 'connect-redis');
    config.store = new RedisStore({ client: redis, prefix: 'hangman:' });
  }

  return session(config);
};

export function createSessionAdapter(passport, redis) {
  return [expressSession(redis), passport.initialize(), passport.session()];
}
