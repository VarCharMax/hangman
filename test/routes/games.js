/* eslint-disable no-undef */

import bodyParser from 'body-parser';
import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import mongoose from '../../src/config/mongoose.js';
import games from '../../src/routes/games.js';
import gamesService from '../../src/services/games.js';

// const TEST_PORT = 5000;

describe('/games', () => {
  // let server;
  let userId, agent, gs, app;
  userId = 'test-user-id';

  before(() => {
    mongoose
      .then((mongoose) => {
        gs = gamesService(mongoose);
        console.log('db created ...');
      })
      .catch((err) => {
        console.log(err);
      });

    app = express();
    app.use(bodyParser.json());
    app.use((req, _res, next) => {
      // users middleware stub.
      req.user = { id: userId };
      next();
    });

    app.use('/games', games);
  });

  beforeEach(function (done) {
    agent = request.agent(app);

    gs.availableTo('non-existent-user') // return all games.
      .then((games) => games.map((game) => game.deleteOne())) // An array of Promises of delete operations.
      .then((gamesRemoved) => Promise.all(gamesRemoved)) // Perform all delete operations.
      .then(() => done(), done);
  });

  describe('/:id DELETE', () => {
    it('should allow users to delete their own games', (done) => {
      gs.create(userId, 'test').then((game) => {
        agent
          .delete('/games/' + game.id)
          .expect(200)
          .end(function (err) {
            if (err) {
              done(err);
            } else {
              gs.createdBy(userId)
                .then((createdGames) => {
                  expect(createdGames).to.be.empty;
                })
                .then(done, done);
            }
          });
      });
    });

    it('should not allow users to delete games that they did not set', (done) => {
      gs.create('another-user-id', 'test').then((game) => {
        agent
          .delete('/games/' + game.id)
          .expect(403)
          .end(function (err) {
            if (err) {
              done(err);
            } else {
              gs.get(game.id)
                .then((createdGame) => {
                  expect(createdGame).ok;
                })
                .then(done, done);
            }
          });
      });
    });

    it('should return a 404 for requests to delete a game that no longer exists', (done) => {
      gs.create(userId, 'test').then((game) => {
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
