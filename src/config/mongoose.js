import { getConnectionString, getNamedExport } from './../lib/libraries.js';

import debug from 'debug';
import mongoose from 'mongoose';

const dbdebug = debug('hangman:config:mongoose');
const { promise, resolve, reject } = Promise.withResolvers();
let mongod = null;
let mongoconn = '';

export async function mongodbClient() {
  dbdebug('Creating db client ...');
  if (process.env.ORMONGO_RS_URL) {
    mongoconn = getConnectionString(process.env.ORMONGO_RS_URL);
    dbdebug(`Connecting to db server: ${mongoconn.substring(0, 50) + '...'} ...`);
    mongoose.connect(mongoconn); // Don't need to await - mongoose handles connection buffering internally;
  } else {
    dbdebug('MongoDB URL not found. Falling back to in-memory database...');
    if (!mongoconn) {
      if (!mongod) {
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
      } else {
        // await mongod.stop();
        await mongod.start();
      }
    }
  }

  let db = mongoose.connection;
  db.once('open', () => {
    resolve(mongoose);
  });
  db.on('error', reject);

  return promise;
}

export { mongod };
