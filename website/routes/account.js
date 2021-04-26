require('dotenv').config()
const express = require('express');
const bcrypt = require('bcrypt')
const { check, validationResult, Result } = require('express-validator');
const User = require("../models/User");
const Client = require("../models/Client")
const jwt = require('jsonwebtoken')
const { authenticate, authenticateClient, authenticateAdmin } = require("../tools/auth");

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
        return res.render('account/login', { errorsList: errorsList, fields: req.body });
    }
    else {
        User.getByEmail(req.body.email)
            .then(user => {
                if (user) {
                    bcrypt.compare(req.body.password, user.password).then(result => {
                        if (!result) {  //jei result = false, reiskia nesutapo
                            return res.render('account/login', { errorsList: [{ message: "Blogas slaptažodis." }], fields: req.body });
                        } else {
                            delete user.password; // is naudotojo objekto išimu jo slaptazodi
                            try {
                                const accessToken = jwt.sign(user, process.env.ACCESS_TOCKEN_SECRET, { expiresIn: '2h' })
                                createCookie(res, "access_token", accessToken, null)
                                return res.redirect('/');
                            } catch (err) {
                                console.log(err);
                                return res.sendStatus(500);
                            }
                            // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
                        }
                    }).catch(error => { //bcrypt promise grazino reject
                        console.log(error)
                        return res.sendStatus(500);
                    });
                } else {
                    return res.render('account/login', { errorsList: [{ message: "toks naudotojas nerastas, bandykite iš naujo." }], fields: req.body }); //nerastas email
                }
            }).catch(err => { console.log(err); return res.sendStatus(500) })

    }
});

router.get('/logout', function (req, res, next) {
    deleteCookie(res, "access_token")
    return res.redirect('/');
});

router.post('/register', [
    // username must be an email
    check('email', 'neteisingas el. pašto adresas').isEmail(),
    check('name', 'vardas neivestas').notEmpty(),
    check('lastname', 'pavarde neivesta').notEmpty(),
    check('phone', 'telefono numeris neivestas').notEmpty(),
    check('password', 'slaptažodis per trumpas, turi būti nors 8 simboliai').isLength({ min: 8 }),
    check('password', 'slaptažodžiai turi sutapti').custom((value, { req, loc, path }) => {
        if (value == req.body.password2)
            return value;
    })
], function (req, res, next) {

    const hasErrors = !myValidationResult(req).isEmpty();

    if (hasErrors) {  // form has errors
        const errorsList = myValidationResult(req).array();
        return res.render('account/registration', { errorsList: errorsList, fields: req.body });
    }
    else { //form is valid
        let email = req.body.email;
        let password = req.body.password;
        let name = req.body.name;
        let lastname = req.body.lastname;
        let phone = req.body.phone;

        User.getByEmail(email).then(gotUser => {
            if (gotUser) // if user is returned then this will be true, if its undefined, then else will be executed
            {
                return res.render('account/registration', { errorsList: [{ message: "toks naudotojas jau yra" }], fields: req.body });
            } 
            else // user dont exist
            {
                bcrypt.genSalt(5)
                    .then(salt => bcrypt.hash(password, salt))
                    .then(hash => User.save(email, hash, '1'))
                    .then(UserId => Client.save(name, lastname, phone, UserId))
                    .then(() => { return res.render('account/login', { fields: { email: email, password: password }, successMessage: "jūsų paskyra sukurta" }); })
                    .catch(error => { console.log(error); return res.sendStatus(400) })
            }
        })
    }
});

router.get('/emailForm', function (req, res, next) {
    res.send('email form page');
});

router.get('/registerForm', function (req, res, next) {
    res.render('account/registration', { fields: {} });
});

router.get('/loginForm', function (req, res, next) {
    res.render('account/login', { fields: {} });
});

router.get('/accountUpdateForm', function (req, res, next) {
    res.send('user edit form page');
});

router.get('/userDelete', authenticateAdmin, function(req, res, next){
    User.delete(req.query.id).then(() => {
        return res.sendStatus(200);
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
});

router.get('/clientUserDelete', authenticateClient, function(req, res, next){
    User.delete(req.user.id).then(() => {
        return res.redirect("/account/logout");
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
});


function createCookie(res, name, value, maxage) {
    //jeigu maxage = null, tada slapukas galios tik esamai sesijai.
    var options = {}
    options['httpOnly'] = true
    if (maxage != null) options['maxAge'] = maxage
    return res.cookie(name, value, options)
}

function deleteCookie(res, name) {
    return res.cookie(name, "", { maxAge: 1 })
}

module.exports = router;
