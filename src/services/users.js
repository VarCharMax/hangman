import redisClient from '../config/redis.js';

const { promise, resolve, reject } = Promise.withResolvers();

export default redisClient
  .then((redis) => {
    const userService = {
      getUserName: (userId) => redis.get(`user:${userId}:name`),
      setUserName: (userId, name) => redis.set(`user:${userId}:name`, name),
      recordWin: (userId) => redis.zIncrBy('user:wins', 1, userId),
      getTopPlayers: () =>
        redis.zRangeWithScores('user:wins', 0, 2, 'rev').then((interleaved) => {
          if (interleaved.length === 0) {
            return [];
          }
          let userIds = interleaved.map((user) => `user:${user.value}:name`);
          return redis.mGet(userIds).then((names) =>
            names.map((username, index) => ({
              name: username,
              userId: interleaved[index].value,
              wins: parseInt(interleaved[index].score),
            }))
          );
        }),
      getRanking: async (userId) => {
        return Promise.all([
          redis.zRevRank('user:wins', userId),
          redis.zScore('user:wins', userId),
        ]).then(([rank, score]) => {
          if (rank == null) {
            return null;
          }
          return { rank: rank + 1, wins: parseInt(score, 10) };
        });
      },
    };

    resolve(userService);

    return promise;
  })
  .catch((err) => {
    reject(`Redis error: ${err.code} - ${err.message}`);
  });
