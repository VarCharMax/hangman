/* eslint-disable no-undef */

import bodyParser from 'body-parser';
import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import profile from '../../src/routes/profile.js';
import { userService } from '../../src/services/users.js';

const userId = 'test-user-id';

describe('/profile', function () {
  let agent, app, uService;

  before(() => {
    app = express();
    app.use(bodyParser.json());
    app.use((req, res, next) => {
      req.user = { id: userId };
      next();
    });

    userService().then((us) => {
      uService = us;
      app.use('/profile', profile(us));
    });
  });

  beforeEach(() => {
    agent = request.agent(app);
  });

  describe('/profile POST', function () {
    it('should set the name of the current user', function (done) {
      agent
        .post('/profile')
        .send({ name: 'User Name' })
        .expect(302)
        .expect('Location', '/')
        .end(function (error) {
          if (error) {
            done(error);
          } else {
            uService
              .getUserName(userId)
              .then((setName) => {
                expect(setName).to.equal('User Name');
              })
              .then(done, done);
          }
        });
    });
  });
});
