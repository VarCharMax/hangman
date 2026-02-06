import express from 'express';

export default (service) => {
  var router = express.Router();

  router.post('/', function (req, res, next) {
    service
      .setUserName(req.user.id, req.body.name)
      .then(() => res.redirect('/'))
      .catch(next);
  });

  return router;
};
