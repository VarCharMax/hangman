"use strict";

module.exports = (mongoose) => {
  var createError = require("http-errors");
  var express = require("express");
  var path = require("path");
  var cookieParser = require("cookie-parser");
  var bodyParser = require("body-parser");
  var logger = require("morgan");

  var users = require("./middleware/users");
  let gamesService = require("./services/games")(mongoose);
  let usersService = require("./services/users");
  var indexRouter = require("./routes/index")(gamesService, usersService);
  var gamesRouter = require("./routes/games")(gamesService, usersService);
  let profile = require("./routes/profile")(usersService);

  var app = express();

  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "hjs");

  if (app.get("env") === "development") {
    app.use(logger("dev"));
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));
  app.use(users);

  app.use("/", indexRouter);
  app.use("/games", gamesRouter);
  app.use("/profile", profile);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  return app;
};
