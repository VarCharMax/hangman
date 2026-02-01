import { MongoMemoryServer } from 'mongodb-memory-server';
import debug from 'debug';
import mongoose from 'mongoose';

const dbdebug = debug('hangman:config:mongoose');

let mongoconn = '';

if (process.env.MONGODB_URL) {
  mongoconn = process.env.MONGODB_URL;
} else {
  dbdebug('MongoDB URL not found. Falling back to in-memory database...');
  const mongoServer = await MongoMemoryServer.create();
  mongoconn = mongoServer.getUri();
}

let db = mongoose.connection;
mongoose.connect(mongoconn);

const dbPromise = new Promise(function (resolve, reject) {
  db.once('open', () => resolve(mongoose));
  db.on('error', reject);
});

export default dbPromise;
