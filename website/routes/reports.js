var express = require('express');
var router = express.Router();
const { authenticateWorker } = require("../tools/auth");

/* GET users listing. */
router.get('/reportCreateForm', authenticateWorker, function(req, res, next) {
  res.send('reports view');
});

router.get('/reportDisplay', authenticateWorker, function(req, res, next) {
  res.send('report display view');
});

module.exports = router;
