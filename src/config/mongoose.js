import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const { promise, resolve, reject } = Promise.withResolvers();

let mongoconn = '';
let devServer = null;

if (process.env.MONGODB_URL) {
  mongoconn = process.env.MONGODB_URL;
  mongoose.connect(mongoconn);
} else {
  MongoMemoryServer.create().then((mongoServer) => {
    devServer = mongoServer;
    mongoconn = mongoServer.getUri();
    mongoose.connect(mongoconn);
  });
}

let db = mongoose.connection;
db.once('open', () => {
  resolve(mongoose);
});
db.on('error', reject);

export default promise;

export { devServer };
