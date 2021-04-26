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

exports.sendMaterialOrder = function (names, orderAmounts, prices, units, total) {

    readConfig()
    .then(config => {
        { return renderOrder(names, orderAmounts, prices, units, total, config) }
    })
    .then(data => {
        var mailOptions = {
            from: 'keramikosstudija111@yahoo.com',
            to: 'kaziliunaslukas@gmail.com',
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

function renderOrder(names, orderAmounts, prices, units, total, config) {
    return new Promise(function (resolve, reject) {
        if (names == undefined || orderAmounts == undefined || prices == undefined || units == undefined || names.length == 0) {
            reject("gauti klaidingi uzsakymo duomenys")
        } else {
            ejs.renderFile(__dirname + "/templates/materialOrderTempl.ejs", { names: names, amounts: orderAmounts, prices: prices, units: units, total: total, details: config.MaterialOrderDetails }, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }


    })
}

