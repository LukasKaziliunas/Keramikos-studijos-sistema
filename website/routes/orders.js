var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/orderCreateForm', function(req, res, next) {
  res.send('order create form');
});

router.get('/order', function(req, res, next) {
  res.send('order view');
});

router.get('/orders', function(req, res, next) {
  res.send('orders list');
});

module.exports = router;
