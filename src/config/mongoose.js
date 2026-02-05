import debug from 'debug';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const { promise, resolve, reject } = Promise.withResolvers();

const dbdebug = debug('hangman:config:mongoose');

let db = mongoose.connection;
db.once('open', () => {
  dbdebug('DB connected ...');
  resolve(mongoose);
});
db.on('error', reject);

let mongoconn = '';
let devServer = null;

if (process.env.MONGODB_URL) {
  mongoconn = process.env.MONGODB_URL;
  mongoose.connect(mongoconn);
} else {
  dbdebug('MongoDB URL not found. Falling back to in-memory database...');
  MongoMemoryServer.create().then((mongoServer) => {
    devServer = mongoServer;
    mongoconn = mongoServer.getUri();
    mongoose.connect(mongoconn);
  });
}

export default promise;

export { devServer };
