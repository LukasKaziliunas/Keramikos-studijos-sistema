var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/reportCreateForm', function(req, res, next) {
  res.send('reports view');
});

router.get('/reportDisplay', function(req, res, next) {
  res.send('report display view');
});

module.exports = router;
