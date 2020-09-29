"use strict";

const middleware = require("../../src/middleware/users");
const expect = require("chai").expect;
const sinon = require("sinon");

describe("Users middleware", () => {
  let request, response;

  beforeEach(() => {
    request = { cookies: {} };
    response = { cookie: () => {} };
  });

  it("if the user already signed in, reads their ID from a cookie and exposes the user on the request", () => {
    // Given
    request.cookies.userId = undefined;
    response = { cookie: sinon.spy() };

    // When
    middleware(request, response, () => {});

    expect(request.user).to.exist;
    const newUserId = request.user.id;
    expect(newUserId).to.exist;
    expect(response.cookie.calledWith("userId", newUserId)).to.be.true;
  });

  it("calls the next middleware in the chain", () => {
    // Given
    const next = sinon.spy();

    // When
    middleware(request, response, next);

    // Then
    expect(next.called).to.be.true;
  });
});
