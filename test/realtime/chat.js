/* eslint-disable no-undef */

import { Server as Socket } from 'socket.io';
import createChatServer from '../../src/realtime/chat.js';
import createClient from 'socket.io-client';
import { expect } from 'chai';
import http from 'http';

describe('chat', function () {
  this.timeout(10000);

  let server,
    io,
    url,
    createUser,
    createdClients = [];

  beforeEach((done) => {
    server = http.createServer();

    server.listen((err) => {
      if (err) {
        done(err);
      } else {
        const addr = server.address();
        url = 'http://127.0.0.1:' + addr.port + '/chat'; // Add namespace to url.

        io = new Socket(server);

        // Translate client extraHeaders data into request user.name.
        io.engine.use((req, res, next) => {
          req.user = {
            name: req.headers.username,
          };
          next();
        });

        createChatServer(io);

        done();
      }
    });
  });

  afterEach((done) => {
    createdClients.forEach((client) => client.disconnect());
    server.close();
    done();
  });

  it('warns unnamed users to choose a username', (done) => {
    const unnamedUser = createUser(null, 'Room1');

    // Unnamed user sending a message should generate a not-logged in response
    // from the server.
    unnamedUser.client.emit('chatMessage', 'Hello!');

    unnamedUser.client.on('chatMessage', (data) => {
      console.log(`Test call back: ${data.message}`);
      expect(data.message).to.contain('choose a username');
      expect(data.username).to.be.undefined;
      expect(data.type).to.equal('warning');
      done();
    });
  });

  it('broadcasts arrival of named users', (done) => {
    let connectedUser = createUser('User1', 'Room1');
    let newUser = createUser('User2', 'Room1');

    //connectedUser should receive a message about newUser joining.
    connectedUser.client.on('chatMessage', (data) => {
      console.log(`Test call back: ${data.message}`);
      expect(data.message).to.contain('arrived');
      expect(data.username).to.equal(newUser.name);
      expect(data.type).to.equal('action');
      done();
    });
  });

  it('broadcasts departure of named users', (done) => {
    let connectedUser = createUser(null, 'Room1');
    let newUser = createUser('User1', 'Room1');
    let left = false;

    // newUser leaving should broadcast message to connectedUser.

    connectedUser.client.on('chatMessage', (data) => {
      if (!left) {
        newUser.client.disconnect();
        left = true;
      } else {
        expect(data.message).to.contain('left');
        expect(data.username).to.equal(newUser.name);
        expect(data.type).to.equal('action');
        done();
      }
    });
  });

  it('emits messages from named users back to all users', (done) => {
    const namedUser = createUser('User1', 'Room1');
    const otherUser = createUser(null, 'Room1');

    const messageReceived = function (data) {
      if (!data.type) {
        // Ignore actions/warnings
        this.received = data;
      }

      if (namedUser.received && otherUser.received) {
        [namedUser.received, otherUser.received].forEach((received) => {
          expect(received.message).to.equal('Hello!');
          expect(received.username).to.equal(namedUser.name);
        });
        done();
      }
    };

    otherUser.client.on('chatMessage', messageReceived.bind(otherUser));
    namedUser.client.on('chatMessage', messageReceived.bind(namedUser));

    namedUser.client.emit('chatMessage', 'Hello!');
  });

  it('emits messages only to users in the same room', (done) => {
    // Given
    let namedUser = createUser('User1', 'Room1');
    let otherUserSameRoom = createUser(null, 'Room1');
    let otherUserDifferentRoom = createUser(null, 'Room2');

    //When
    let messagesSentToSameRoom = 0;
    let messagesSentToDifferentRoom = 0;
    let sendMessage = (i) => namedUser.client.emit('chatMessage', `Hello ${i}`);

    otherUserDifferentRoom.client.on('chatMessage', () => {
      // Don't ignore actions: We want the count to include arrival
      // notifications, since we shouldn't receive any of these.
      ++messagesSentToDifferentRoom;
    });
    otherUserSameRoom.client.on('chatMessage', (message) => {
      if (!message.type && ++messagesSentToSameRoom < 10) {
        sendMessage(messagesSentToSameRoom);
      } else {
        // Then
        expect(messagesSentToDifferentRoom).to.equal(0);
        done();
      }
    });

    sendMessage(0);
  });

  //Emulate browser IO client.
  createUser = (name, room) => {
    let headers = {};
    if (name) {
      headers.username = name;
    }

    let user = {
      name: name,
      client: createClient(url, { extraHeaders: headers }), //middleware will convert this into user.name request object.
    };

    createdClients.push(user.client);

    //This is same init call as in browser script.
    user.client.emit('joinRoom', room);

    return user;
  };
});
