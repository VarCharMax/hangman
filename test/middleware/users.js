/* eslint-disable no-undef */

import * as chai from 'chai';

import factory from '../../src/middleware/users.js';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

describe('Users middleware', () => {
  const defaultUserId = 'user-id-1';
  let expect, request, response, middleware, usersService;

  before((done) => {
    expect = chai.expect;
    chai.should();
    chai.use(sinonChai);
    done();
  });

  beforeEach(() => {
    request = { cookies: { userId: defaultUserId } };
    response = { cookie: () => {} };
    usersService = { getUserName: sinon.stub() };
    middleware = factory(usersService);
  });

  it('if the user already signed in, reads their ID from a cookie and exposes the user on the request', () => {
    // Given
    const username = 'User Name';
    usersService.getUserName.withArgs(defaultUserId).returns(Promise.resolve(username));

    // When
    middleware(request, response, () => {
      // Then
      expect(request.user).to.exist;
      expect(request.user.id).to.equal(defaultUserId);
      expect(request.user.name).to.equal(username);
      done();
    });
  });

  it('calls the next middleware in the chain', async () => {
    const next = sinon.spy();

    // const username = 'User Name';
    usersService.getUserName.withArgs(defaultUserId).returns(Promise.resolve());
    // When
    await middleware(request, response, next);

    // Then
    expect(next).to.have.been.calledOnce;
  });

  it('if the user is not already signed in, creates a new user id and stores it in a cookie', (done) => {
    // Given
    request.cookies.userId = undefined;
    const response = { cookie: sinon.spy() };

    // When
    middleware(request, response, () => {
      // Then
      expect(request.user).to.exist;
      const newUserId = request.user.id;
      expect(newUserId).to.exist;
      expect(response.cookie.calledWith('userId', newUserId)).ok;
      done();
    });
  });
});
