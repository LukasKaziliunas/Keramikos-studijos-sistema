const jwt = require('jsonwebtoken')
require('dotenv').config()


exports.authenticate = function(req, res, next){

    const token = req.cookies.access_token
    if (token == null) return res.render('index', { layout:  './layouts/clientLayout', auth: false }); // nera tokeno slapukyje, reikia prisijungti (401 Unauthorized)
    jwt.verify(token, process.env.ACCESS_TOCKEN_SECRET, (err, user) => {
        if (err) return res.render('index', { layout:  './layouts/clientLayout', auth: false }); // baigesi galiojimo laikas (403 forbidden), sesijos laikas baigesi
        req.user = user
        next()
    })
}