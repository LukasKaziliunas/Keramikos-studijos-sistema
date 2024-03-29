var nodemailer = require('nodemailer');
const ejs = require("ejs");
const Order = require("../models/Order");
const MaterialOrder = require("../models/MaterialOrder");
var { readConfig } = require("./readFiles");

var transporter = nodemailer.createTransport({
    service: "Yahoo",
    auth: {
        user: 'keramikosstudija111@yahoo.com',
        pass: 'mdnmpdtpanqiqmfy'
    }
});

exports.sendMaterialOrder = function (orders, total, supplierEmail) {
     
        readConfig()
        .then(config => {
            { return renderOrder(orders, total, config) }
        })
        .then(data => {
            var mailOptions = {
                from: 'keramikosstudija111@yahoo.com',
                to: supplierEmail,
                subject: 'Medžiagų pirkimo užsakymas',
                html: data,
            };
    
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                   
                }
            });
        })
        .catch(err => console.log(err));
    
}

exports.sendPassword = function(email, password){
    console.log(email, password)
    var mailOptions = {
        from: 'keramikosstudija111@yahoo.com',
        to: email,
        subject: 'Naujas slaptažodis',
        text: `Jūsų naujas slaptažodis yra ${password}.`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function renderOrder(orders, total, config) {
    return new Promise(function (resolve, reject) {
        if ( total == undefined || orders == undefined || orders.length == 0) {
            reject("gauti klaidingi uzsakymo duomenys")
        } else {
            ejs.renderFile(__dirname + "/templates/materialOrderTempl.ejs", { orders: orders, total: total, details: config.MaterialOrderDetails }, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }
    })
}

