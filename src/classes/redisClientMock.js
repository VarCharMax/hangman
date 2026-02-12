/* eslint-disable no-unused-vars */

import EventEmitter from 'events';
import redisjs from 'redis-js';

// Mock methods aren't asynchronous, so we wrap them in Promises.
export class redisClientMock extends EventEmitter {
  #redisClientTmp;
  constructor() {
    super();
    this.#redisClientTmp = redisjs.createClient();
    this.on('ready', () => {});
  }
  connect() {
    this.emit('ready', () => {});
  }
  zRangeWithScores(name, start, end, _param1) {
    return new Promise((resolve, _reject) => {
      let returnVal = this.#redisClientTmp
        .zrevrange(name, start, end, 'withscores') // translate ['user5', 5, 'user4', 4] into [{value: 'user5', score: 5}, {value: 'user4', score: 4}]
        .reduce((accumulator, currentValue, index, sourceArray) => {
          // Check if the current index is even
          if (index % 2 === 0) {
            accumulator.push({
              value: currentValue,
              score: sourceArray[index + 1],
            });
          }
          return accumulator;
        }, []);
      resolve(returnVal);
    });
  }
  get(name) {
    return new Promise((resolve, _reject) => {
      let returnVal = this.#redisClientTmp.get(name);
      resolve(returnVal);
    });
  }
  set(key, val) {
    return new Promise((resolve, _reject) => {
      let returnVal = this.#redisClientTmp.set(key, val);
      resolve(returnVal);
    });
  }
  zIncrBy(key, val, id) {
    return new Promise((resolve, _reject) => {
      let returnVal = this.#redisClientTmp.zincrby(key, val, id);
      resolve(returnVal);
    });
  }
  mGet(ids) {
    return new Promise((resolve, _reject) => {
      let returnVal = this.#redisClientTmp.mget(ids);
      resolve(returnVal);
    });
  }
  zRevRank(val, id) {
    return new Promise((resolve, _reject) => {
      let returnVal = this.#redisClientTmp.zrevrank(val, id);
      resolve(returnVal);
    });
  }
  zScore(key, user1, user2) {
    return new Promise((resolve, _reject) => {
      let returnVal = this.#redisClientTmp.zscore(key, user1, user2);
      resolve(returnVal);
    });
  }
  flushDb() {
    return new Promise((resolve, _reject) => {
      let returnVal = this.#redisClientTmp.flushdb();
      resolve(returnVal);
    });
  }
  destroy() {
    return new Promise((resolve, _reject) => {
      let returnVal = this.#redisClientTmp.quit();
      resolve(returnVal);
    });
  }
}
