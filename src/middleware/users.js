import * as uuid from 'uuid';

export default (usersService) => {
  return function (req, res, next) {
    let userId = req.cookies.userId;
    if (!userId) {
      userId = uuid.v4();
      res.cookie('userId', userId);
      req.user = {
        id: userId,
      };
      next();
    } else {
      usersService.getUserName(userId).then((username) => {
        req.user = {
          id: userId,
          name: username,
        };
        next();
      });
    }
  };
};
