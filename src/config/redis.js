import debug from 'debug';
import { getNamedExport } from './../lib/libraries.js';

const redisdebug = debug('hangman:config:redis');
const { promise, resolve, reject } = Promise.withResolvers();

export async function createRedisClient() {
  let client;
  redisdebug('Connecting to Redis ...');
  if (process.env.REDIS_URL) {
    const createClient = await getNamedExport('createClient', 'redis');
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: process.env.REDIS_URL.match(/rediss:/) != null,
        rejectUnauthorized: false
      }
    });
  } else {
    redisdebug('Redis URL not found. Falling back to mock DB ...');
    const redisClientMock = await getNamedExport(
      'redisClientMock',
      '../classes/redisClientMock.js'
    );
    client = new redisClientMock();
  }

  client.on('ready', () => {
    redisdebug(
      `Redis client connected on ${client.options ? client.options.url : 'mock DB'}.`
    );
    resolve(client);
  });
  client.on('error', (err) => reject(err));

  client.connect();

  return promise;
}
