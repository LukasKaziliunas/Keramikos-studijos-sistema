var express = require('express');
var router = express.Router();
var { authenticate } = require("../tools/auth");

/* GET users listing. */
router.get('/', authenticate, function(req, res, next) {
  res.render('index', { layout:  './layouts/clientLayout', auth: true });
});

router.get('/basket', function(req, res, next) {
  res.send('basket view');
});

router.get('/options', function(req, res, next) {
  res.send('options view');
});

router.get('/gallery', function(req, res, next) {
  res.send('gallery view');
});

module.exports = router;
