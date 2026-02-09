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
  zRange(name, start, end, param1, param2) {
    return new Promise((resolve, reject) => {
      let returnVal = this.#redisClientTmp.zrange(name, start, end, param1, param2);
      resolve(returnVal);
    });
  }
  get(name) {
    return new Promise((resolve, reject) => {
      let returnVal = this.#redisClientTmp.get(name);
      resolve(returnVal);
    });
  }
  set(key, val) {
    return new Promise((resolve, reject) => {
      let returnVal = this.#redisClientTmp.set(key, val);
      resolve(returnVal);
    });
  }
  zIncrBy(key, val, id) {
    return new Promise((resolve, reject) => {
      let returnVal = this.#redisClientTmp.zincrby(key, val, id);
      resolve(returnVal);
    });
  }
  mGet(ids) {
    return new Promise((resolve, reject) => {
      let returnVal = this.#redisClientTmp.met(ids);
      resolve(returnVal);
    });
  }
  zRevRank(val, id) {
    return new Promise((resolve, reject) => {
      let returnVal = this.#redisClientTmp.zrevrank(val, id);
      resolve(returnVal);
    });
  }
  zScore(key, user1, user2) {
    return new Promise((resolve, reject) => {
      let returnVal = this.#redisClientTmp.zscore(key, user1, user2);
      resolve(returnVal);
    });
  }
  destroy() {}
}
