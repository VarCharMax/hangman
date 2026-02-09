export default (io) => {
  const namespace = io.of('/chat');

  namespace.on('connection', (socket) => {
    const user = socket.request.user;
    let username;

    if (user && user.name) {
      username = user.name;
    }

    socket.on('joinRoom', (room) => {
      socket.join(room);

      if (username) {
        socket.to(room).emit('chatMessage', {
          username: username,
          message: 'has arrived',
          type: 'action',
        });
      }

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
