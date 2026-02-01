import { createClient } from 'redis';
import debug from 'debug';
import redisjs from 'redis-js';

const { promise, resolve, reject } = Promise.withResolvers();
const redisdebug = debug('hangman:config:redis');
let redisClient;

if (process.env.REDIS_URL) {
  redisClient = createClient(process.env.REDIS_URL);
  redisClient.on('ready', () => resolve(redisClient));
  redisClient.on('error', (err) => reject(err));
  redisClient.connect();
} else {
  redisdebug('Redis URL not found. Falling back to mock DB ...');
  redisClient = redisjs;
  resolve(redisClient);
}

export default promise;
