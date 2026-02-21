import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter-oauth2';
import { getDefaultExport } from '../lib/libraries';
import passport from 'passport';

export function passportClient(usersService) {
  const providerCallback = (providerName) =>
    function (req, token, tokenSecret, profile, done) {
      usersService
        .getOrCreate(providerName, profile.id, profile.username || profile.displayName)
        .then((user) => done(null, user), done);
    };

  if (process.env.TWITTER_APP_ID && process.env.TWITTER_APP_SECRET) {
    passport.use(
      new TwitterStrategy(
        {
          clientID: process.env.TWITTER_APP_ID,
          clientSecret: process.env.TWITTER_APP_SECRET,
          callbackURL: `http://127.0.0.1:${process.env.PORT}/auth/twitter/callback`,
          // passReqToCallback: true,
        },
        providerCallback('twitter')
      )
    );
  }

  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: `http://127.0.0.1:${process.env.PORT}/auth/facebook/callback`,
          //passReqToCallback: true,
        },
        providerCallback('facebook')
      )
    );
  }

  if (process.env.NODE_ENV === 'test') {
    const LocalStrategy = getDefaultExport('passport-local');
    const uuid = getDefaultExport('uuid');
    passport.use(
      new LocalStrategy((username, password, done) => {
        const userId = uuid.v4();
        usersService.setUserName(userId, username).then(() => {
          done(null, { id: userId, name: username });
        });
      })
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    usersService
      .getUser(id)
      .then((user) => done(null, user))
      .catch(done);
  });

  return passport;
}
