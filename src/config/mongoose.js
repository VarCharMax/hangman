import { getDefaultExport } from './../lib/libraries.js';
import mongoose from 'mongoose';

let mongod = null;

const mongooseServer = async () => {
  const { promise, resolve, reject } = Promise.withResolvers();
  let mongoconn = '';

  if (process.env.MONGODB_URL) {
    mongoconn = process.env.MONGODB_URL;
    mongoose.connect(mongoconn); // Don't need to await - mongoose handles connection buffering internally;
  } else {
    const MongoMemoryServer = await getDefaultExport('mongodb-memory-server');

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

  return promise;
};

export default mongooseServer;

export { mongod };
