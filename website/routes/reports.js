var express = require('express');
var router = express.Router();
const Order = require("../models/Order");
let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
const fs = require('fs')
const { authenticateWorker } = require("../tools/auth");


router.get('/reportsMain', authenticateWorker, function(req, res, next) {
  const dir = path.join(__dirname, '../public/reports');
  const files = fs.readdirSync(dir);
  let ts = Date.now();  
  let date_ob = new Date(ts);
  let date = date_ob.getDate();
  let month = date_ob.getMonth() + 1;
  let year = date_ob.getFullYear();
  let fullDate = date + "-" + month + "-" + year;

  return res.render('reports/reportsMain', { layout: './layouts/workerLayout', pdfs: files, date: fullDate})
});

router.post('/generateReport', authenticateWorker, function(req, res, next) {

  let pdfName = req.body.name + ".pdf";
  let ordersP = Order.getFilteredOrders(req.body.from, req.body.to);

  Promise.all([ordersP])
  .then(values => {
    ejs.renderFile(path.join(__dirname, `../views/reports/reportsTemplate.ejs`), { orders: values[0], from: req.body.from, to: req.body.to }, function (err, html) {
      if (err) {
        res.send(err);
      } else {
        pdf.create(html, {}).toFile(path.join(__dirname, `../public/reports/${pdfName}`), function (err, filePath) {
          if (err) {
            res.send(err);
          } else {
            res.redirect(`/reports/reportDisplay?name=${pdfName}`);
          } 
        });
      }
    });
  })
  .catch(err => { console.log(err); return res.sendStatus(500) })

});

router.get('/reportDisplay', authenticateWorker, function(req, res, next) {
  let pdfName = req.query.name;
  var pdfPath = path.join(__dirname, `../public/reports/${pdfName}`);
  console.log(pdfPath)
    if (fs.existsSync(pdfPath)) {
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res)
    } else {
        res.status(500)
        console.log('File not found')
        res.send('File not found')
    }
});

module.exports = router;
