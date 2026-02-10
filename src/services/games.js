import EventEmitter from 'events';

const emitter = new EventEmitter();

export default function (mongoose) {
  let Game = mongoose.models['Game'];

  if (!Game) {
    const Schema = mongoose.Schema;
    const gameSchema = new Schema({
      word: String,
      setBy: String,
      solvedBy: [String],
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

    gameSchema.post('save', (game) => emitter.emit('gameSaved', game));
    gameSchema.post('deleteOne', (game) => emitter.emit('gameRemoved', game));

    Game = mongoose.model('Game', gameSchema);
  }

  //Closure
  let gs_methods = {
    create: (userId, word) => {
      let game = new Game({ setBy: userId, word: word.toUpperCase() });
      return game.save();
    },
    recordWinner: async (gameId, userId) => {
      const filter = { _id: gameId };
      const updateDoc = {
        $push: {
          solvedBy: userId,
        },
      };
      await Game.updateOne(filter, updateDoc);
    },
    get: (id) => Game.findById(id),
    createdBy: (userId) => Game.find({ setBy: userId }),
    availableTo: (userId) =>
      Game.find({ setBy: { $ne: userId }, solvedBy: { $nin: [userId] } }),
    events: emitter,
  };

  return new Promise((resolve, reject) => {
    if (!mongoose) {
      reject('Database not available.');
    }
    resolve(gs_methods);
  });
}

const events = emitter;

export { events };
