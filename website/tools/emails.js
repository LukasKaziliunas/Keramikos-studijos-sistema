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

exports.sendMaterialOrder = function (orderId) {

    let orderP = Order.getById(orderId);
    let orderMaterialP = MaterialOrder.getOrdersInfo(orderId);
    let readConfigP = readConfig();

    Promise.all([orderP, orderMaterialP, readConfigP]).then(values => { return renderOrder(values[0], values[1], values[2]) })
        .then(data => {
            var mailOptions = {
                from: 'keramikosstudija111@yahoo.com',
                to: 'lukas.kaziliunas1@gmail.com',
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

function renderOrder(order, materialsOrders, config) {
    return new Promise(function (resolve, reject) {
        if (order == undefined || materialsOrders == undefined || materialsOrders.length == 0) {
            reject("gauti klaidingi uzsakymo duomenys")
        } else {
            ejs.renderFile(__dirname + "/templates/materialOrder.ejs", { order: order, materialsOrders: materialsOrders, contactDetails: config.ContactDetails }, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }


    })
}

