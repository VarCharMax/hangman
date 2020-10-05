"use strict";

module.export = (gamesService, usersService) => {
  var express = require("express");
  var router = express.Router();

  router.get("/", function (req, res, next) {
    Promise.all([
      gamesService.createdBy(req.user.id),
      gamesService.availableTo(req.user.id),
      usersService.getUsername(req.user.id),
      usersService.getRanking(req.user.id),
      usersService.getTopPlayers(),
    ])
      .then(([createdGames, availableGames, username, ranking, topPlayers]) => {
        res.render("index", {
          title: "Hangman",
          userId: req.user.id,
          createdGames: createdGames,
          availableGames: availableGames,
          username: username,
          ranking: ranking,
          topPlayers: topPlayers,
          partials: { createdGame: "createdGame" },
        });
      })
      .catch(next);
  });

  return router;
};
