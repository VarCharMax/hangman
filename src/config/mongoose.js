import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const { promise, resolve, reject } = Promise.withResolvers();

let mongoconn = '';
let mongod = null;

if (process.env.MONGODB_URL) {
  mongoconn = process.env.MONGODB_URL;
  mongoose.connect(mongoconn); // Don't need to await - mongoose handles connection buffering internally;
} else {
  MongoMemoryServer.create().then((mongoServer) => {
    mongod = mongoServer;
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

export { mongod };
