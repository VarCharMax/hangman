import { getNamedExport } from './../lib/libraries.js';
import session from 'express-session';

const expressSession = async (redis) => {
  let config = {
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false
  };

  if (redis) {
    const RedisStore = await getNamedExport('RedisStore', 'connect-redis');
    const redisStore = new RedisStore(session);
    config.store = new redisStore({ client: redis });
  }

  return session(config); //OK
};

export function sessionAdapter(passport, redis) {
  return [expressSession(redis), passport.initialize(), passport.session()];
}
