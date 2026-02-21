import * as uuid from 'uuid';

export default (service) => {
  return function (req, res, next) {
    let userId = req.session.userId;
    if (!userId) {
      userId = uuid.v4();
      res.session.userId = userId;
      req.user = {
        id: userId,
      };
      next();
    } else {
      service.getUserName(userId).then((username) => {
        req.user = {
          id: userId,
          name: username,
        };
        next();
      });
    }
  };
};
