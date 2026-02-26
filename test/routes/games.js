import bodyParser from 'body-parser';
import { expect } from 'chai';
import express from 'express';
import { gameService } from '../../src/services/games.js';
import games from '../../src/routes/games.js';
import { mongodbClient } from '../../src/config/mongoose.js';
import request from 'supertest';

describe('/games', () => {
  let userId, agent, g_service, app;
  userId = 'test-user-id';

  before((done) => {
    mongodbClient()
      .then((mg) => {
        app = express();
        app.use(bodyParser.json());
        app.use((req, _res, next) => {
          // users middleware stub.
          req.user = { id: userId };
          next();
        });
        gameService(mg).then((gs) => {
          g_service = gs;
          app.use('/games', games(g_service));
          done();
        });
      })
      .catch((err) => done(err));
  });

  beforeEach(() => {
    agent = request.agent(app);
  });

  describe('/:id DELETE', () => {
    it('should allow users to delete their own games', (done) => {
      g_service.create(userId, 'test').then((game) => {
        agent
          .delete('/games/' + game.id)
          .expect(200)
          .end(function (err) {
            if (err) {
              done(err);
            } else {
              g_service
                .createdBy(userId)
                .then((createdGames) => {
                  expect(createdGames).to.be.empty;
                })
                .then(done, done);
            }
          });
      });
    });

    it('should not allow users to delete games that they did not set', (done) => {
      g_service.create('another-user-id', 'test').then((game) => {
        agent
          .delete('/games/' + game.id)
          .expect(403)
          .end(function (err) {
            if (err) {
              done(err);
            } else {
              g_service
                .get(game.id)
                .then((createdGame) => {
                  expect(createdGame).ok;
                })
                .then(done, done);
            }
          });
      });
    });

    it('should return a 404 for requests to delete a game that no longer exists', (done) => {
      g_service.create(userId, 'test').then((game) => {
        agent
          .delete(`/games/${game.id}`)
          .expect(200)
          .end(function (err) {
            if (err) {
              done(err);
            } else {
              agent.delete('/games/' + game.id).expect(404, done);
            }
          });
      });
    });
  });
});
