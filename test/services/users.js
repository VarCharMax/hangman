/* eslint-disable no-undef */

import { expect } from 'chai';
import service from '../../src/services/users.js';

let u_service;

before((done) => {
  service.then((us) => {
    u_service = us;
    done();
  });
});

describe('User service', function () {
  describe('getUsername', function () {
    it('should return a previously set username', (done) => {
      const userId = 'user-id-1';
      const name = 'User Name';
      u_service
        .setUserName(userId, name)
        .then(() => u_service.getUserName(userId))
        .then((actual) => expect(actual).to.equal(name))
        .then(() => done(), done);
    });

    it('should return null if no username', (done) => {
      const userId = 'user-id-2';

      u_service
        .getUserName(userId)
        .then((name) => expect(name).to.be.null)
        .then(() => done(), done);
    });
  });
});
