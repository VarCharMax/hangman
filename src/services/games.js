import EventEmitter from 'events';

const emitter = new EventEmitter();

export default function gameService(mongoose) {
  const { promise, resolve, reject } = Promise.withResolvers();

  if (!mongoose) {
    reject('Database not available.');
  }

  let Game = mongoose.models['Game'];

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

    gameSchema.post('save', (game) => emitter.emit('gameSaved', game));
    gameSchema.post('remove', (game) => emitter.emit('gameRemoved', game));

    Game = mongoose.model('Game', gameSchema);
  }

  //Closure
  const gs_methods = {
    create: async (userId, word) => {
      let game = new Game({ setBy: userId, word: word.toUpperCase() });
      return game.save();
    },
    get: async (id) => Game.findById(id),
    createdBy: async (userId) => Game.find({ setBy: userId }),
    availableTo: async (userId) => Game.find({ setBy: { $ne: userId } }),
    events: emitter,
  };

  resolve(gs_methods);

  return promise;
}

const events = emitter;
export { events };
