var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('worker home page');
});

router.get('/pottery', function(req, res, next) {
  res.send('pottery list page');
});

router.get('/potteryCreateForm', function(req, res, next) {
  res.send('pottery create form');
});

router.get('/potteryUpdateForm', function(req, res, next) {
  res.send('pottery edit form');
});

router.get('/matterialCreateForm', function(req, res, next) {
  res.send('matterial add form');
});

router.get('/matterialUpdateForm', function(req, res, next) {
  res.send('matterial edit form');
});

module.exports = router;
