import { createClient } from 'redis';
import debug from 'debug';
import { redisClientMock } from '../classes/redisClientMock.js';

const { promise, resolve, reject } = Promise.withResolvers();
const redisdebug = debug('hangman:config:redis');
let redisClient;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  });
} else {
  redisdebug('Redis URL not found. Falling back to mock DB ...');
  redisClient = new redisClientMock();
}

redisClient.on('ready', () => resolve(redisClient));
redisClient.on('error', (err) => reject(err));

redisClient.connect();

export default promise;
