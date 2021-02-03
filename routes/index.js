var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  // kad naudotu kita layout res.render('index', { title: 'Express' , layout:  './layouts/worker' });
});

module.exports = router;
