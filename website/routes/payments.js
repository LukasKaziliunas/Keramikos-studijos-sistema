var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/selectMethod', function(req, res, next) {
  res.send('payment selection view');
});

module.exports = router;
