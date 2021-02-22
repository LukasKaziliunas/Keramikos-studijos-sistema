var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('clients home view');
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
