var express = require('express');
var router = express.Router();
var { authenticate } = require("../tools/auth");

/* GET home page. */
router.get('/', authenticate, function (req, res, next) {
  if (req.user.userType == 1)
    res.redirect('/clients');
  else if (req.user.userType == 2)
    res.redirect('/inventory');
  else if (req.user.userType == 3)
    res.redirect('/administration');
  else
    res.sendStatus(500);
});

module.exports = router;
