import { redisClient } from '../config/redis.js';

const { promise, resolve, reject } = Promise.withResolvers();

//TODO: To be consistent, redisClient should get passed in as parameter.

export function userService() {
  redisClient().then((redis) => {
    if (!redis) {
      reject('Redis server not found.');
    }

    const userService = {
      getUserName: (userId) => redis.get(`user:${userId}:name`),
      setUserName: (userId, name) => redis.set(`user:${userId}:name`, name),
      recordWin: (userId) => redis.zIncrBy('user:wins', 1, userId),
      getTopPlayers: () =>
        redis
          .zRangeWithScores('user:wins', 0, 2, {
            REV: true,
          })
          .then((interleaved) => {
            //[{value: 'one', score: 1}, {value: 'uno', score: 1}]
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
  });

  return promise;
}

export default userService;
