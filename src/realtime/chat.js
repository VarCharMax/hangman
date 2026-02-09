export default (io) => {
  const namespace = io.of('/chat');

  namespace.on('connection', (socket) => {
    const user = socket.request.user;

    socket.on('joinRoom', (room) => {
      socket.join(room);

      if (user) {
        socket.broadcast.to.room(room).emit('chatMessage', {
          username: user.name,
          message: 'has arrived',
          type: 'action',
        });
      }

      socket.on('chatMessage', (message) => {
        if (!user) {
          socket.emit('chatMessage', {
            message: 'Please choose a username',
            type: 'warning',
          });
        } else {
          namespace.to.room(room).emit('chatMessage', {
            username: user.name,
            message: message,
          });
        }
      });

      socket.on('disconnect', () => {
        if (user) {
          socket.broadcast.to(room).emit('chatMessage', {
            username: user.name,
            message: 'has left',
            type: 'action',
          });
        }
      });
    });
  });
};
