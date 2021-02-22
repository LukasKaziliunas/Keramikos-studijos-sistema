var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('administration home');
});

router.get('/supplierCreateForm', function(req, res, next) {
  res.send('supplier create form page');
});

router.get('/supplierUpdateForm', function(req, res, next) {
  res.send('supplier edit form page');
});

router.get('/users', function(req, res, next) {
  res.send('users managment page');
});

router.get('/suppliers', function(req, res, next) {
  res.send('suppliers list page');
});


module.exports = router;
