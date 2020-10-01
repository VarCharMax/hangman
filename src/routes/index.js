"use strict";

var express = require("express");
var router = express.Router();
var games = require("../services/games");

/* GET home page. */
router.get("/", function (req, res, next) {
  Promise.all([games.createdBy(req.user.id), games.availableTo(req.user.id)])
    .then(([created, available]) => {
      res.render("index", {
        title: "Hangman",
        userId: req.user.id,
        createdGames: created,
        availableGames: available,
        partials: { createdGame: "createdGame" },
      });
    })
    .catch(next);
});

module.exports = router;
