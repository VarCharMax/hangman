import { getNamedExport } from './../lib/libraries.js';
import session from 'express-session';

const expressSession = async (redis) => {
  let config = {
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false
  };

  if (redis) {
    const redisStore = await getNamedExport('RedisStore', 'connect-redis');
    config.store = new redisStore({ client: redis, prefix: 'hangman:' });
  }

  return session(config);
};

export async function sessionAdapter(passport, redis) {
  return [await expressSession(redis), passport.initialize(), passport.session()];
}
