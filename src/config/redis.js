import debug from 'debug';
import { getNamedExport } from './../lib/libraries.js';

const redisdebug = debug('hangman:config:redis');

const redisClient = async () => {
  const { promise, resolve, reject } = Promise.withResolvers();

  let client;

  if (process.env.REDIS_URL) {
    const createClient = await getNamedExport('createClient', 'redis');
    client = createClient({
      url: process.env.REDIS_URL,
    });
  } else {
    redisdebug('Redis URL not found. Falling back to mock DB ...');
    const redisClientMock = await getNamedExport(
      'redisClientMock',
      '../classes/redisClientMock.js'
    );
    client = new redisClientMock();
  }

  client.on('ready', () => resolve(client));
  client.on('error', (err) => reject(err));

  client.connect();

  return promise;
};

export default redisClient;
