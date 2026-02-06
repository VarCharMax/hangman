/* eslint-disable no-unused-vars */

import { createClient } from 'redis';
import debug from 'debug';
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
  redisClient.connect();
} else {
  redisdebug('Redis URL not found. Falling back to mock DB ...');

  let redisClientTmp = redisjs.createClient();

  let redisClientMock = {
    connect: () => {
      return new Promise((resolve, reject) => {
        resolve(() => {});
      });
    },
    zrange: (name, start, end, param1, param2) => {
      return new Promise((resolve, reject) => {
        let val = redisClientTmp.zrange(name, start, end, param1, param2);
        resolve(val);
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
    zincrby: (key, val, id) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.set(key, val, id);
        resolve(returnVal);
      });
    },
    mget: (ids) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.mget(ids);
        resolve(returnVal);
      });
    },
    zrevrank: (val, id) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.zrevrank(val, id);
        resolve(returnVal);
      });
    },
    zscore: (key, user1, user2) => {
      return new Promise((resolve, reject) => {
        let returnVal = redisClientTmp.zscore(key, user1, user2);
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
