/* eslint-disable no-undef */

import { expect } from 'chai';
import dbase from '../../src/config/mongoose.js';
import gservice from '../../src/services/games.js';

describe('Game service', () => {
  const firstUserId = 'user-id-1';
  const secondUserId = 'user-id-2';
  let service;

  before((done) => {
    dbase
      .then((mongoose) => {
        gservice(mongoose).then((gs) => {
          service = gs;
          done();
        });
      })
      .catch(done);
  });

  beforeEach(function (done) {
    service
      .availableTo('non-existent-user')
      .then((games) => games.map((game) => game.deleteOne()))
      .then((gamesRemoved) => Promise.all(gamesRemoved))
      .then(() => done(), done);
  });

  describe('list of available games', () => {
    it('should include games set by other users', (done) => {
      service
        .create(firstUserId, 'testing') // First user creates single game.
        .then(() => service.availableTo(secondUserId)) // Game will become available to second user.
        .then((games) => {
          expect(games.length).to.equal(1); // Expect (1) game.
          let game = games[0];
          expect(game.setBy).to.equal(firstUserId);
          expect(game.word).to.equal('TESTING');
        })
        .then(done, done);
    });

    it('should not include games set by the same user', (done) => {
      service
        .create(firstUserId, 'testing')
        .then(() => service.availableTo(secondUserId))
        .then((games) => {
          expect(games.length).to.equal(1);
          let game = games[0];
          expect(game.setBy).to.not.equal(secondUserId);
        })
        .then(done, done);
    });
  });
});
