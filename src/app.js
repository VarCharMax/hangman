 

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
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

export default function application(mongoose) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  var app = new express();
  let gs = gameService(mongoose);

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
  app.use(users);
  app.use('/', routes(gs));
  app.use('/games', games(gs));

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
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
    });
  });
  return app;
}
