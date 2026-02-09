import * as uuid from 'uuid';

export default (service) => {
  return function (socket, next) {
    let userId = socket.request.cookies.userId;
    if (!userId) {
      userId = uuid.v4();
      socket.request.res.cookie('userId', userId);
      socket.request.user = {
        id: userId,
      };
      next();
    } else {
      service.getUserName(userId).then((username) => {
        socket.request.user = {
          id: userId,
          name: username,
        };
        next();
      });
    }
  };
};
