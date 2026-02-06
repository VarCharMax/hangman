/* eslint-disable no-unused-vars */

import debug from 'debug';
import { createClient } from 'redis';
import redisjs from 'redis-js';

const { promise, resolve, reject } = Promise.withResolvers();
const redisdebug = debug('hangman:config:redis');
let redisClient;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    // socket: { host: '10.211.55.2', port: 6379 },
  });
  redisClient.on('ready', () => resolve(redisClient));
  redisClient.on('error', (err) => reject(err));
  redisClient.connect().then((r) => {
    console.log(r);
  });
} else {
  redisdebug('Redis URL not found. Falling back to mock DB ...');

  let redisClientTmp = redisjs.createClient();

  // Mock methods aren't asynchronous, so we wrap them in Promises.
  let redisClientMock = {
    connect: () => {
      return new Promise((resolve, reject) => {
        resolve(() => {});
      });
    },
    zRange: (name, start, end, param1, param2) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.zRange(name, start, end, param1, param2);
        resolve(returnVal);
      });
    },
    get: (name) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.get(name);
        resolve(returnVal);
      });
    },
    set: (key, val) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.set(key, val);
        resolve(returnVal);
      });
    },
    zIncrBy: (key, val, id) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.zIncrBy(key, val, id);
        resolve(returnVal);
      });
    },
    mGet: (ids) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.mGet(ids);
        resolve(returnVal);
      });
    },
    zRevRank: (val, id) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.zRevRank(val, id);
        resolve(returnVal);
      });
    },
    zScore: (key, user1, user2) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.zScore(key, user1, user2);
        resolve(returnVal);
      });
    },
    destroy: () => {},
  };

  redisClient = redisClientMock;
  resolve(redisClient);
}

export default promise;

export { redisClient };
