import express from 'express';

export default (gameService, usersService) => {
  const router = express.Router();

  /* GET home page. */
  router.get('/', function (req, res, next) {
    let userId = null;

    if (req.user) {
      userId = req.user.id;
    }

    Promise.all([
      gameService.createdBy(userId),
      gameService.availableTo(userId),
      usersService.getUserName(userId),
      usersService.getRanking(userId),
      usersService.getTopPlayers(),
    ])
      .then(([created, available, username, ranking, top]) => {
        res.render('index', {
          title: 'Hangman',
          loggedIn: req.user.isAuthenticated(),
          userId: userId,
          createdGames: created,
          availableGames: available,
          username: username,
          ranking: ranking,
          topPlayers: top,
          partials: { createdGame: 'createdGame' },
        });
      })
      .catch(next);
  });

  return router;
};
