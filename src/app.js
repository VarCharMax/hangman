import bodyParser from 'body-parser';
import debug from 'debug';
import express from 'express';
import favicon from 'serve-favicon';
import { fileURLToPath } from 'url';
import { gameService } from './services/games.js';
import gamesRoute from './routes/games.js';
import homeRoute from './routes/index.js';
import logger from 'morgan';
import { passportClient } from './config/passport.js';
import path from 'path';
import profileRoute from './routes/profile.js';
import { redisClient } from './config/redis.js';
import render from 'hogan-express';
import { sessionAdapter } from './middleware/sessions.js';
import { usersService } from './services/users.js';

//Cache promise to create singleton provider.
const { promise, resolve, reject } = Promise.withResolvers();

export function Application(db) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const appdebug = debug('hangman:app');

  var app = new express();

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'html');
  app.engine('html', render);
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  if (app.get('env') === 'development') {
    app.use(logger('dev'));
  }
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  gameService(db)
    .then((gs) => {
      redisClient()
        .then((redis) => {
          usersService(redis)
            .then(async (us) => {
              passportClient(us).then(async (passport) => {
                const addAuthEndpoints = (provider) => {
                  app.post(`/auth/${provider}`, passport.authenticate(provider));
                  app.get(
                    `/auth/${provider}/callback`,
                    passport.authenticate(provider, {
                      successRedirect: '/',
                      failureRedirect: '/',
                      session: true
                    })
                  );
                };

                // let sessionMiddlewares = await sessionAdapter(passport, redis);

                app.use(await sessionAdapter(passport, redis)); // Array of middlewares.
                addAuthEndpoints('twitter');
                addAuthEndpoints('facebook');

                if (process.env.NODE_ENV === 'test') {
                  app.post(
                    '/auth/test',
                    passport.authenticate('local', { successRedirect: '/' })
                  );
                }
              });

              app.use('/', homeRoute(gs, us));
              app.use('/games', gamesRoute(gs, us));
              app.use('/profile', profileRoute(us));

              // catch 404 and forward to error handler
              app.use(function (req, res, next) {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
              });

              // error handlers

              // development error handler
              // will print stacktrace
              if (app.get('env') === 'development') {
                app.use(function (err, _req, res, _next) {
                  res.status(err.status || 500);
                  res.render('error', {
                    message: err.message,
                    error: err
                  });
                });
              }
            })
            .catch((err) => {
              // Users Service error.
              appdebug(err);
              reject(err);
            });

          // production error handler
          // no stacktraces leaked to user
          app.use(function (err, _req, res, _next) {
            res.status(err.status || 500);
            res.render('error', {
              message: err.message,
              error: {}
            });
          });

          resolve(app);
        })
        .catch((err) => {
          //Redis client error.
          appdebug(err);
          reject(err);
        });
    })
    .catch((err) => {
      //Game Service error.
      appdebug(err);
      reject(err);
    });

  return promise;
}
