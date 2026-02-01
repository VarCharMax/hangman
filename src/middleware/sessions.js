import RedisStore from 'connect-redis';
import session from 'express-session';

let config = {
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
};

if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
  const redisStore = RedisStore(session);
  config.store = new redisStore({ url: process.env.REDIS_URL });
}

const expressSession = session(config);

export default (passport) => [expressSession, passport.initialize(), passport.session()];
