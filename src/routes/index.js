import express from 'express';

export default function router(gameService) {
  const routes = express.Router();

  /* GET home page. */
  routes.get('/', function (req, res, next) {
    Promise.all([
      gameService.createdBy(req.user.id),
      gameService.availableTo(req.user.id),
    ])
      .then(([created, available]) => {
        res.render('index', {
          title: 'Hangman',
          userId: req.user.id,
          createdGames: created,
          availableGames: available,
          partials: { createdGame: 'createdGame' },
        });
      })
      .catch(next);
  });

  return routes;
}
