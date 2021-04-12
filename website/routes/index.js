var express = require('express');
var router = express.Router();
var { authenticate } = require("../tools/auth");

/* GET home page. */
router.get('/', authenticate, function (req, res, next) {
  if (req.user.userType == 1)//client
    res.redirect('/clients/gallery');
  else if (req.user.userType == 2)//worker
    res.redirect('/inventory');
  else if (req.user.userType == 3)//admin
    res.redirect('/administration');
  else
    res.sendStatus(500);
});

module.exports = router;
