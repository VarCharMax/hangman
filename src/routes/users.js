'use strict';

import express from 'express';

var router = express.Router();

/* GET users listing. */
// eslint-disable-next-line no-unused-vars
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

export default router;
