import redisClient from '../config/redis.js';

const { promise, resolve, reject } = Promise.withResolvers();

export default redisClient.then((redis) => {
  if (!redis) {
    reject('Redis server not available.');
  }

  const redisServer = {
    getUserName: (userId) => redis.get(`user:${userId}:name`),
    setUserName: (userId, name) => redis.set(`user:${userId}:name`, name),
    recordWin: (userId) => redis.zincrby('user:wins', 1, userId),
    getTopPlayers: async () =>
      await redis.zrange('user:wins', 0, 2, 'rev', 'withscores').then((interleaved) => {
        if (interleaved.length === 0) {
          return [];
        }
        let userIds = interleaved
          .filter((_user, index) => index % 2 === 0)
          .map((userId) => `user:${userId}:name`);
        return redis.mget(userIds).then((names) =>
          names.map((username, index) => ({
            name: username,
            userId: interleaved[index * 2],
            wins: parseInt(interleaved[index * 2 + 1]),
          }))
        );
      }),
    getRanking: async (userId) => {
      const out = Promise.all([
        redis.zrevrank('user:wins', userId),
        redis.zscore('user:wins', userId, userId),
      ]);
      if (out[0] === null) {
        return null;
      }
      return { rank: out[0] + 1, wins: parseInt(out[1], 10) };
    },
  };

  resolve(redisServer);
  return promise;
});
