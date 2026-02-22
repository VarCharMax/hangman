import * as uuid from 'uuid';

const { promise, resolve, reject } = Promise.withResolvers(); //Cache promise.

const usersService = (redis) => {
  if (!redis) {
    reject('Redis server not found.');
  }

  const getUser = (userId) =>
    redis.get(`user:${userId}:name`).then((userName) => ({
      id: userId,
      name: userName
    }));

  const setUserName = (userId, name) => redis.set(`user:${userId}:name`, name);

  const userService = {
    getOrCreate: (provider, providerId, providerUsername) => {
      let providerKey = `provider:${provider}:${providerId}:user`;
      let newUserId = uuid.v4();
      return redis.setNx(providerKey, newUserId).then((created) => {
        if (created) {
          return setUserName(newUserId, providerUsername).then(() => getUser(newUserId));
        } else {
          return redis.get(providerKey).then(getUser);
        }
      });
    },
    getUser: getUser,
    getUserName: (userId) => redis.get(`user:${userId}:name`),
    setUserName: setUserName,
    recordWin: (userId) => redis.zIncrBy('user:wins', 1, userId),
    getTopPlayers: () =>
      redis
        .zRangeWithScores('user:wins', 0, 2, {
          REV: true
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
              wins: parseInt(interleaved[index].score)
            }))
          );
        }),
    getRanking: async (userId) => {
      return Promise.all([
        redis.zRevRank('user:wins', userId),
        redis.zScore('user:wins', userId)
      ]).then(([rank, score]) => {
        if (rank == null) {
          return null;
        }
        return { rank: rank + 1, wins: parseInt(score, 10) };
      });
    }
  };

  resolve(userService);

  return promise;
};

export { usersService };
