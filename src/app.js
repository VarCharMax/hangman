import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import debug from 'debug';
import express from 'express';
import render from 'hogan-express';
import logger from 'morgan';
import path from 'path';
import favicon from 'serve-favicon';
import { fileURLToPath } from 'url';
import users from './middleware/users.js';
import games from './routes/games.js';
import routes from './routes/index.js';
import gameService from './services/games.js';
import userService from './services/users.js';

const appdebug = debug('hangman:app');

export default function application(mongoose) {
  const { promise, resolve, reject } = Promise.withResolvers();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  var app = new express();

  app.set('view engine', 'html');
  app.set('views', path.join(__dirname, 'views'));
  app.engine('html', render);
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  if (app.get('env') === 'development') {
    app.use(logger('dev'));
  }
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  gameService(mongoose)
    .then((gs) => {
      userService
        .then((us) => {
          app.use(users(us));
          app.use('/', routes(gs, us));
          app.use('/games', games(gs, us));

          // catch 404 and forward to error handler
          app.use(function (_req, _res, next) {
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
                error: err,
              });
            });
          }

          // production error handler
          // no stacktraces leaked to user
          app.use(function (err, _req, res, _next) {
            res.status(err.status || 500);
            res.render('error', {
              message: err.message,
              error: {},
            });
          });

          resolve(app);
        })
        .catch((err) => {
          appdebug(err);
          reject(err);
        });
    })
    .catch((err) => {
      appdebug(err);
      reject(err);
    });

  return promise;
}
