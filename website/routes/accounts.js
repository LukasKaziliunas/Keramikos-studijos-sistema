var express = require('express');
var bodyParser = require('body-parser');

var router = express.Router();

router.use(function (req, res, next){
    bodyParser.urlencoded({ extended: true })
    next();
});

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('accounts');
});

router.get('/login', function (req, res, next) {
    res.send('login page');
});

router.post('/register', function (req, res, next) {
    console.log(req.body);
    res.sendStatus(200);
});

router.get('/emailForm', function (req, res, next) {
    res.send('email form page');
});

router.get('/registerForm', function (req, res, next) {
    res.render('registration', { title: 'registration' });
});

router.get('/accountUpdateForm', function (req, res, next) {
    res.send('user edit form page');
});

router.get('/profile', function (req, res, next) {
    res.send('account view page');
});

module.exports = router;
