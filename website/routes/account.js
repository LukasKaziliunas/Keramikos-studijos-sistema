require('dotenv').config()
var express = require('express');
const bcrypt = require('bcrypt')
var { check, validationResult, Result } = require('express-validator');
const User = require("../models/User");
const jwt = require('jsonwebtoken')

var router = express.Router();

const myValidationResult = validationResult.withDefaults({
    formatter: error => {
        return {
            message: error.msg,
        };
    },
});


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('accounts');
});

router.post('/login', [
    check('email', 'neteisingas el. pašto adresas').isEmail(),
    check('password', 'slaptažodis neįvestas').notEmpty()
], function (req, res, next) {

    const hasErrors = !myValidationResult(req).isEmpty();

    if (hasErrors) {
        const errorsList = myValidationResult(req).array();
        res.render('login', { errorsList: errorsList, fields: req.body });
    }
    else {
        User.getByEmail(req.body.email)
            .then(user => {
                if (user) {
                    bcrypt.compare(req.body.password, user.password).then(result => {
                        if (!result) {  //jei result = false, reiskia nesutapo
                            res.render('login', { errorsList: [{ message: "Blogas slaptažodis." }], fields: req.body });
                        } else {
                            delete user.password; // is naudotojo objekto išimu jo slaptazodi
                            try {
                                const accessToken = jwt.sign(user, process.env.ACCESS_TOCKEN_SECRET, { expiresIn: '15min' })
                                createCookie(res, "access_token", accessToken, null)
                                res.send(accessToken);
                            } catch (err) {
                                console.log(err);
                                res.sendStatus(500);
                            }

                            // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
                        }


                    }).catch(error => { //bcrypt promise grazino reject
                        console.log(error)
                        res.sendStatus(500);
                    });
                } else {
                    res.render('login', { errorsList: [{ message: "toks naudotojas nerastas, bandykite iš naujo." }], fields: req.body }); //nerastas email
                }
            }).catch(err => console.log(err))

    }
});

router.get('/logout', function (req, res, next) {
    deleteCookie(res, "access_token")
    res.sendStatus(200);
});

router.post('/register', [
    // username must be an email
    check('email', 'neteisingas el. pašto adresas').isEmail(),
    // password must be at least 5 chars long
    check('password', 'slaptažodis per trumpas').isLength({ min: 2 }),
    check('password', 'slaptažodžiai turi sutapti').custom((value, { req, loc, path }) => {
        if (value == req.body.password2)
            return value;
    })
], function (req, res, next) {

    const hasErrors = !myValidationResult(req).isEmpty();

    if (hasErrors) {
        const errorsList = myValidationResult(req).array();
        res.render('registration', { title: 'registration form', errorsList: errorsList, fields: req.body });
    }
    else {
        var email = req.body.email;
        var password = req.body.password;

        bcrypt.genSalt(5)
            .then(salt => bcrypt.hash(password, salt))
            .then(hash => User.save(email, hash, '1'))
            .then(() => res.sendStatus(200))
            .catch(error => { console.log(error); res.sendStatus(400) })
    }
});

router.get('/emailForm', function (req, res, next) {
    res.send('email form page');
});

router.get('/registerForm', function (req, res, next) {
    res.render('registration', { title: 'registration form', fields: {} });
});

router.get('/loginForm', function (req, res, next) {
    res.render('login', { fields: {} });
});

router.get('/accountUpdateForm', function (req, res, next) {
    res.send('user edit form page');
});

router.get('/profile', authenticate, function (req, res, next) {
    res.send('account view page');
    console.log(req.user);
});

function createCookie(res, name, value, maxage)
{
    //jeigu maxage = null, tada slapukas galios tik esamai sesijai.
  var options = {}
  options['httpOnly'] = true
  if(maxage != null) options['maxAge'] = maxage
  res.cookie(name, value , options)
}

function deleteCookie(res, name)
{
    res.cookie(name, "" , {maxAge: 1})
}

function authenticate(req, res, next){
  
    const token = req.cookies.access_token
    if(token == null) return res.sendStatus(401) // nera tokeno slapukyje, reikia prisijungti (Unauthorized)
    jwt.verify(token, process.env.ACCESS_TOCKEN_SECRET, (err, user) => {
      if(err) return res.sendStatus(403) // baigesi galiojimo laikas (forbidden), sesijos laikas baigesi
      req.user = user
      next()
    })
  }


module.exports = router;
