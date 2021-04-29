require('dotenv').config()
var express = require('express');
const { body } = require('express-validator');
var router = express.Router();
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Pottery = require("../models/Pottery");
const PotteryOrder = require("../models/PotteryOrder");
const PurchasedPottery = require("../models/PurchasedPottery");
const { authenticateClient, authenticateWorker } = require("../tools/auth");

router.get('/orderConfirmForm', authenticateClient, async function(req, res, next) {

  let orderType = req.query.orderType;
  let total = req.query.total;
  var deliveryTypesP = Order.getDeliveryTypes();
  var PaymentTypesP = Payment.getPaymentTypes();

  if(orderType == 2)
  {
    
    Promise.all([deliveryTypesP, PaymentTypesP]).then(values => {
      return res.render('clients/orderConfirm', { layout: './layouts/clientLayout', auth: true, delivery: values[0], payments: values[1], price: total, email: req.user.email });
    }).catch(err => { console.log(err); return res.sendStatus(500) })
  }else if(orderType == 1)
  {
    console.log(req.query)
    var orderDetails = {
      photo: req.query.photo,
      potteryType: req.query.potteryType,
      amount: req.query.amount,
      comment: req.query.comment
    }


    let potteryTypePriceP = Pottery.getTypePrice(req.query.potteryType);
    Promise.all([deliveryTypesP, PaymentTypesP, potteryTypePriceP]).then(values => {
      return res.render('clients/individualOrderConfirm', { layout: './layouts/clientLayout', auth: true, delivery: values[0], payments: values[1], price: (values[2].price * req.query.amount).toFixed(2), orderDetails: JSON.stringify(orderDetails) });
    }).catch(err => { console.log(err); return res.sendStatus(500) })
  }else{
    return res.sendStatus(400);
  }
});

router.post('/createOrder', authenticateClient, function(req, res, next) {

  let orderType = req.body.orderType;
  let paymentType = req.body.paymentType;
  let total = req.body.total;
  let orderId;
  var totalToCents = (req.body.total * 100).toFixed(2);
  if(orderType == 2){  //purchase order
    
    let stripePublicKey = process.env.STRIPE_PUBLIC;
    Order.save(total, req.body.city, req.body.address, req.body.postalCode, 1, orderType, req.body.deliveryType, req.user.id)
    .then(gotOrderId => { orderId = gotOrderId; return PurchasedPottery.save(gotOrderId, req.body.basket); })
    .then(() => { 
      if(paymentType == 1){
        return res.render('clients/payment', { layout: './layouts/clientLayout', auth: true, stripePublicKey: stripePublicKey, price: totalToCents, orderId: orderId, paymentType: req.body.paymentType, email: req.user.email }); 
      }else{
        Payment.save(total, paymentType, "", orderId)
        .then( () => { return res.redirect("/") });
      }
      
    })
    .catch(err => { console.log(err); return res.sendStatus(500) })
  }else if(orderType == 1){ //individual order
    let stripePublicKey = process.env.STRIPE_PUBLIC;
    let orderDetails = JSON.parse(req.body.orderDetails);
    Order.save(total, req.body.city, req.body.address, req.body.postalCode, 1, orderType, req.body.deliveryType, req.user.id)
    .then(gotOrderId => { orderId = gotOrderId; return PotteryOrder.save(orderDetails.comment, orderDetails.potteryType, orderDetails.amount, gotOrderId, orderDetails.photo) })
    .then(() => {
      if(paymentType == 1){
        return res.render('clients/payment', { layout: './layouts/clientLayout', auth: true, stripePublicKey: stripePublicKey, price: totalToCents, orderId: orderId, paymentType: req.body.paymentType, email: req.user.email }); 
      }else{
        Payment.save(total, paymentType, "", orderId)
        .then( () => { return res.redirect("/") });
      }

    })
  }else{
    return res.sendStatus(200)
  }
});

router.post('/purchase', authenticateClient, function(req, res, next) {

    Payment.save((req.body.price / 100 ).toFixed(2), req.body.paymentType, "", req.body.orderId)
    .then( () => res.sendStatus(200))
    .catch(err => { console.log(err); return res.sendStatus(500) })

});

router.get('/ordersList', authenticateWorker, function(req, res, next) {
  var filter = 0;
  var page = 1;
  if(req.query.filter != undefined){
    filter = req.query.filter;
  }
  if(req.query.page != undefined){
    page = req.query.page;
  }
  Order.getFullOrderDetails(filter, page - 1).then(orderList => {
      return res.render('orders/ordersList', { layout: './layouts/workerLayout', orders: orderList, filter: filter, page: page, active: 3  }); 
  })
});

router.get('/orderInfo', authenticateWorker, function(req, res, next) {

  var orderId = req.query.orderId;
  var orderType = req.query.orderType;
  var orderState = req.query.orderState;
  if(orderType == 1){
    //individualus
    PotteryOrder.get(orderId).then(potteryOrder => {
        return res.render('orders/individualOrderInfo', { layout: './layouts/workerLayout', potteryOrder: potteryOrder, orderId: orderId, state: orderState, active: 3 });
    })
  }else if(orderType == 2){
    //pirkimo
    PurchasedPottery.get(orderId).then(items => {
        return res.render('orders/purchaseOrderInfo', { layout: './layouts/workerLayout', items: items, orderId: orderId, state: orderState, active: 3 });
    })
  }else{
    return res.sendStatus(400);
  }

});

router.get('/clientOrderInfo', authenticateClient, function(req, res, next) {

  var orderId = req.query.orderId;
  var orderType = req.query.orderType;
  var orderState = req.query.orderState;
  if(orderType == 1){
    //individualus
    PotteryOrder.get(orderId).then(potteryOrder => {
        return res.render('orders/clientIndividualOrderInfo', { layout: './layouts/clientLayout', auth: true, potteryOrder: potteryOrder, orderId: orderId, state: orderState, email: req.user.email });
    })
  }else if(orderType == 2){
    //pirkimo
    PurchasedPottery.get(orderId).then(items => {
        return res.render('orders/clientPurchaseOrderInfo', { layout: './layouts/clientLayout', auth: true, items: items, orderId: orderId, state: orderState, email: req.user.email });
    })
  }else{
    return res.sendStatus(400);
  }

});

router.get('/updateState', authenticateWorker, function(req, res, next) {
  var id = req.query.id;
  var state = req.query.state;
  Order.updateState(id, state)
  .then(() => { return res.sendStatus(200); })
  .catch(err => { console.log(err); return res.sendStatus(500) })
});

router.get('/userOrders', authenticateClient, function(req, res, next) {
  Order.getClientOrders(req.user.id).then(orders => {
    return res.render('orders/userOrders', { layout: './layouts/clientLayout', auth: true, orders: orders, email: req.user.email });
  })
  .catch(err => { console.log(err); return res.sendStatus(500) })
});

module.exports = router;


