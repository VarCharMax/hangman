export default (io) => {
  const namespace = io.of('/chat');

  namespace.on('connection', (socket) => {
    let username = null;
    if (socket.request.user) {
      username = socket.request.user.name;
    }

    //'joinRoom' event
    socket.on('joinRoom', (room) => {
      socket.join(room);

      if (username) {
        // Send message to all clients except originator.
        socket.broadcast.to(room).emit('chatMessage', {
          username: username,
          message: 'has arrived',
          type: 'action',
        });
      }

      // Send message back to client.
      socket.on('chatMessage', (message) => {
        if (!username) {
          socket.emit('chatMessage', {
            message: 'Please choose a username',
            type: 'warning',
          });
        } else {
          namespace.to(room).emit('chatMessage', {
            username: username,
            message: message,
          });
        }
      });

      socket.on('disconnect', () => {
        if (username) {
          socket.broadcast.to(room).emit('chatMessage', {
            username: username,
            message: 'has left',
            type: 'action',
          });
        }
      });
    });
  });
};
