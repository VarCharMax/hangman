import debug from 'debug';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const dbdebug = debug('hangman:config:mongoose');

let mongoServer;
let mongoconn = '';
('mongodb://10.211.55.2/hangman');

if (!mongoconn) {
  dbdebug('MongoDB URL not found. Falling back to in-memory database...');
  mongoServer = await MongoMemoryServer.create();
  mongoconn = mongoServer.getUri();
}

let db = mongoose.connection;
mongoose.connect(mongoconn);

const dbPromise = new Promise(function (resolve, reject) {
  db.once('open', () => resolve(mongoose));
  db.on('error', reject);
});

export default dbPromise;
