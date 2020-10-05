"use strict";

module.exports = (mongoose) => {
  const Game = mongoose.model("Game");

  if (!Game) {
    const Schema = mongoose.Schema;
    const gameSchema = new Schema({
      word: String,
      setBy: String,
    });

    gameSchema.methods.positionsOf = function (character) {
      let positions = [];
      for (let i in this.word) {
        if (this.word[i] === character.toUpperCase()) {
          positions.push(i);
        }
      }
      return positions;
    };

    gameSchema.methods.matches = function (word) {
      return this.word === word.toUpperCase();
    };

    Game = mongoose.model("Game", gameSchema);

    return {
      create: (userId, word) => {
        let game = new Game({ setBy: userId, word: word.toUpperCase() });
        return game.save();
      },
      get: (id) => Game.findById(id),
      createdBy: (userId) => Game.find({ setBy: userId }),
      availableTo: (userId) => Game.where("setBy").ne(userId),
    };
  }
};
