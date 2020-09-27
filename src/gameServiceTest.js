"use strict";

let assert = require("assert");
let service = require("./services/games.js");

// Give
service.create("firstUserId", "testing");

// When
let games = service.availableTo("secondUserId");

// Then
assert.strictEqual(games.length, 1);
let game = games[0];
assert.strictEqual(game.setBy, "firstUserId");
assert.strictEqual(game.word, "TESTING");
