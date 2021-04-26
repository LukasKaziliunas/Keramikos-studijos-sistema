const jwt = require('jsonwebtoken')
require('dotenv').config()

// redirects to main page if not authorized
exports.authenticate = function(req, res, next){

    const token = req.cookies.access_token
    if (token == null) return res.redirect('/clients'); // nera tokeno slapukyje, reikia prisijungti (401 Unauthorized)
    jwt.verify(token, process.env.ACCESS_TOCKEN_SECRET, (err, user) => {
        if (err) return res.redirect('/clients'); // baigesi galiojimo laikas (403 forbidden), sesijos laikas baigesi
        
        req.user = user
        next()
    })
}

exports.isLoggedIn = function(req, res, next){
    const token = req.cookies.access_token
    var isLoggedIn = true;
    if (token == null) isLoggedIn = false; // nera tokeno slapukyje,
    jwt.verify(token, process.env.ACCESS_TOCKEN_SECRET, (err, user) => {
        if (err) isLoggedIn = false; // baigesi galiojimo laikas (403 forbidden)
        
        req.isLoggedIn = isLoggedIn;
        if(isLoggedIn){
            req.user = user
        }
        next()
    })
}

exports.authenticateClient = function(req, res, next){

    const token = req.cookies.access_token
    if (token == null) return res.redirect('/clients'); // nera tokeno slapukyje, reikia prisijungti (401 Unauthorized)
    jwt.verify(token, process.env.ACCESS_TOCKEN_SECRET, (err, user) => {
        if (err) return res.redirect('/clients'); // baigesi galiojimo laikas (403 forbidden), sesijos laikas baigesi
        
        if(user.userType != 1)
        {
            return res.redirect('/');
        }else{
            req.user = user
            next()  
        }
    })
}

exports.authenticateWorker = function(req, res, next){

    const token = req.cookies.access_token
    if (token == null) return res.redirect('/clients'); // nera tokeno slapukyje, reikia prisijungti (401 Unauthorized)
    jwt.verify(token, process.env.ACCESS_TOCKEN_SECRET, (err, user) => {
        if (err) return res.redirect('/clients'); // baigesi galiojimo laikas (403 forbidden), sesijos laikas baigesi
        
        if(user.userType != 2)
        {
            return res.redirect('/');
        }else{
            req.user = user
            next()  
        }
    })
}

exports.authenticateAdmin = function(req, res, next){

    const token = req.cookies.access_token
    if (token == null) return res.redirect('/clients'); // nera tokeno slapukyje, reikia prisijungti (401 Unauthorized)
    jwt.verify(token, process.env.ACCESS_TOCKEN_SECRET, (err, user) => {
        if (err) return res.redirect('/clients'); // baigesi galiojimo laikas (403 forbidden), sesijos laikas baigesi
        
        if(user.userType != 3)
        {
            return res.redirect('/');
        }else{
            req.user = user
            next()  
        }
    })
}

