import { getNamedExport } from './../lib/libraries.js';
import mongoose from 'mongoose';

let mongod = null;
let mongoconn = '';
const { promise, resolve, reject } = Promise.withResolvers();

export async function mongodbClient() {
  if (process.env.MONGODB_URL) {
    mongoconn = process.env.MONGODB_URL;
    mongoose.connect(mongoconn); // Don't need to await - mongoose handles connection buffering internally;
  } else {
    const MongoMemoryServer = await getNamedExport(
      'MongoMemoryServer',
      'mongodb-memory-server'
    );

    MongoMemoryServer.create().then((mongoServer) => {
      mongod = mongoServer;
      //Will return a randomised port every time it gets called. So important not to
      //call it more than once.
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
}

export { mongod };
