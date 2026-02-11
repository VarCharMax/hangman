/* eslint-disable no-undef */

import { expect } from 'chai';
import factory from '../../src/middleware/users.js';
import sinon from 'sinon';

describe('Users middleware', () => {
  const defaultUserId = 'user-id-1';
  let request, response, middleware, usersService;

  beforeEach(() => {
    request = { cookies: {} };
    response = { cookie: () => {} };
    usersService = { getUsername: sinon.stub() };
    middleware = factory(usersService);
  });

  it('if the user already signed in, reads their ID from a cookie and exposes the user on the request', () => {
    // Given
    request.cookies.userId = defaultUserId;

    // When
    middleware(request, response, () => {});

    // Then
    expect(request.user).to.exist;
    expect(request.user.id).to.equal(defaultUserId);
  });

  it('calls the next middleware in the chain', () => {
    const next = sinon.spy();

    // When
    middleware(request, response, next);

    // Then
    // expect(calledNext).to.be.true;
    expect(next.called).to.be.true;
  });

  it(
    'if the user is not already signed in, ' +
      'creates a new user id and stores it in a cookie',
    () => {
      // Given
      request.cookies.userId = undefined;
      response = { cookie: sinon.spy() };

      // When
      middleware(request, response, () => {});

      // Then
      expect(request.user).to.exist;
      const newUserId = request.user.id;
      expect(newUserId).to.exist;
      expect(response.cookie.calledWith('userId', newUserId)).to.be.true;
    }
  );
});
