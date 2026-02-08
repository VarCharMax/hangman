import express from 'express';

export default (gameService, usersService) => {
  const routes = express.Router();

  routes.post('/', function (req, res, next) {
    const word = req.body.word;
    if (word && /^[A-Za-z]{3,}$/.test(word)) {
      gameService
        .create(req.user.id, word)
        .then((game) => res.redirect(`/games/${game.id}/created`))
        .catch(next);
    } else {
      res
        .status(400)
        .send('Word must be at least three characters long and contain only letters');
    }
  });

  routes.get('/:id', function (req, res, next) {
    checkGameExists(
      req.params.id,
      res,
      (game) =>
        res.render('game', {
          length: game.word.length,
          id: game.id,
        }),
      next
    );
  });

  routes.post('/:id/guesses', function (req, res, next) {
    checkGameExists(
      req.params.id,
      res,
      (game) => {
        if (req.user && game.matches(req.body.word)) {
          usersService.recordWin(req.user.id);
        }
        res.send({
          positions: game.positionsOf(req.body.letter),
        });
      },
      next
    );
  });

  routes.delete('/:id', function (req, res, next) {
    checkGameExists(
      req.params.id,
      res,
      (game) => {
        if (game.setBy === req.user.id) {
          game
            .deleteOne()
            .then(() => res.send())
            .catch(next);
        } else {
          res.status(403).send('You do not have permission to delete this game');
        }
      },
      next
    );
  });

  routes.get('/:id/created', function (req, res, _next) {
    checkGameExists(req.params.id, res, (game) => {
      res.render('createdGame', { id: game.id, word: game.word });
    });
  });

  const checkGameExists = function (id, res, onSuccess, onError) {
    gameService
      .get(id)
      .then((game) => {
        if (game) {
          onSuccess(game);
        } else {
          res.status(404).send('Non-existent game ID');
        }
      })
      .catch(onError);
  };

  return routes;
};
