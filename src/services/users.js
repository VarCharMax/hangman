import redisClient from '../config/redis.js';

const { promise, resolve, reject } = Promise.withResolvers();

export default redisClient
  .then((redis) => {
    const userService = {
      getUserName: (userId) => redis.get(`user:${userId}:name`),
      setUserName: (userId, name) => redis.set(`user:${userId}:name`, name),
      recordWin: (userId) => redis.zIncrBy('user:wins', 1, userId),
      getTopPlayers: () =>
        redis.zRange('user:wins', 0, 2, 'rev', 'withscores').then((interleaved) => {
          if (interleaved.length === 0) {
            return [];
          }
          let userIds = interleaved
            .filter((_user, index) => index % 2 === 0)
            .map((userId) => `user:${userId}:name`);
          return redis.mGet(userIds).then((names) =>
            names.map((username, index) => ({
              name: username,
              userId: interleaved[index * 2],
              wins: parseInt(interleaved[index * 2 + 1]),
            }))
          );
        }),
      getRanking: (userId) => {
        Promise.all([
          redis.zRevRank('user:wins', userId),
          redis.zScore('user:wins', userId, userId),
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
