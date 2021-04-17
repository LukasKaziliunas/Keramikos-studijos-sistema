require('dotenv').config()
var express = require('express');
const { body } = require('express-validator');
var router = express.Router();
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const PotteryPurchase = require("../models/PotteryPurchase");
const Pottery = require("../models/Pottery");
const PotteryOrder = require("../models/PotteryOrder");
const { authenticateClient } = require("../tools/auth");

router.post('/orderConfirmForm', authenticateClient, async function(req, res, next) {

  let orderType = req.body.orderType;
  var deliveryTypesP = Order.getDeliveryTypes();
  var PaymentTypesP = Payment.getPaymentTypes();

  if(orderType == 3)
  {
    items = req.body.items
    if (!Array.isArray(items))
    items = [items];

    let total = await calculateTotal(req.body.price)
    Promise.all([deliveryTypesP, PaymentTypesP]).then(values => {
      return res.render('clients/orderConfirm', { layout: './layouts/clientLayout', auth: true, delivery: values[0], payments: values[1], items: items, orderType: req.body.orderType, price: total });
    }).catch(err => { console.log(err); return res.sendStatus(500) })
  }else if(orderType == 1)
  {
    let total = potteryPrice(req.body.potteryType)
    let potteryOrder = {
      potteryType: req.body.potteryType,
      clay: req.body.clay,
      glaze: req.body.glaze,
      comment: req.body.comment,
      price: total
    }
    Promise.all([deliveryTypesP, PaymentTypesP]).then(values => {
    return res.render('clients/orderConfirm', { layout: './layouts/clientLayout', auth: true, delivery: values[0], payments: values[1], orderType: req.body.orderType, price: total, potteryOrder: JSON.stringify(potteryOrder) });
    }).catch(err => { console.log(err); return res.sendStatus(500) })
  }else{
    return res.sendStatus(400);
  }

});

router.post('/createOrder', authenticateClient, function(req, res, next) {

  let orderType = req.body.orderType;
  let orderId;

  if(orderType == 3){  //purchase order
    let price = (req.body.price * 100).toFixed(2);
    let stripePublicKey = process.env.STRIPE_PUBLIC;
    Order.save(price, req.body.city, req.body.address, 3, orderType, req.body.deliveryType)
    .then(GotOrderId => { orderId = GotOrderId; return PotteryPurchase.save(req.body.postal, GotOrderId, 1) })
    .then(GotPurchaseId => { return Pottery.changeStateOrdered(GotPurchaseId, req.body.items) })
    .then(() => { return res.render('clients/payment', { layout: './layouts/clientLayout', auth: true, stripePublicKey: stripePublicKey, price: price, orderId: orderId, paymentType: req.body.paymentType, items: req.body.items, orderType: orderType }); })
    .catch(err => { console.log(err); return res.sendStatus(500) })
  }else if(orderType == 1){ //pottery order
    let potteryOrder = JSON.parse(req.body.potteryOrder);
    let price = (req.body.price * 100).toFixed(2);
    let stripePublicKey = process.env.STRIPE_PUBLIC;
    Order.save(price, req.body.city, req.body.address, 3, orderType, req.body.deliveryType)
    .then(GotOrderId => { orderId = GotOrderId; return PotteryOrder.save(potteryOrder.comment, potteryOrder.potteryType, orderId, 1, potteryOrder.clay, potteryOrder.glaze) })
    .then(() => { return res.render('clients/payment', { layout: './layouts/clientLayout', auth: true, stripePublicKey: stripePublicKey, price: price, orderId: orderId, paymentType: req.body.paymentType, items: {}, orderType: orderType }); })
    .catch(err => { console.log(err); return res.sendStatus(500) })
  }else{
    return res.sendStatus(200)
  }

});

router.post('/purchase', authenticateClient, function(req, res, next) {

    let orderType = req.body.orderType;
  if(orderType == 1){
    let total = req.body.price / 100;
    Payment.save(total, req.body.paymentType, "", req.body.orderId)
    .then(() => { return res.sendStatus(200) })
    .catch(err => { console.log(err); return res.sendStatus(500) })
  }else if(orderType == 3){
    let items = req.body.items.split(",");
    Pottery.getItemsPriceTotal(items)
    .then(result => { return Payment.save(result.total, req.body.paymentType, "", req.body.orderId) })
    .then(() => { return  res.send("payment saved")})
    .catch(err => { console.log(err); return res.sendStatus(500) })
  }else{
    return res.sendStatus(400)
  }

});

module.exports = router;

function calculateTotal(pricesArray)
{
  let total = 0;
  if (!Array.isArray(pricesArray))
  pricesArray = [pricesArray];

  pricesArray.forEach(price => {
   total += parseFloat(price); 
  });
  total = total.toFixed(2)
  return total;
}

function potteryPrice(potteryType)
{
  let price;
  switch(potteryType)
  {
    case '1':
      price = 50.00;
      break;
    case '2':
      price = 40.00;
      break;
    case '3':
      price = 60.00;
      break;
    case '4':
      price = 80.00; 
      break;
    default:
      price = -1;
  }
  return price;
}