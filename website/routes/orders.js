require('dotenv').config()
var express = require('express');
var router = express.Router();
const Order = require("../models/Order");
const Photo = require("../models/Photo");
const Payment = require("../models/Payment");
const Pottery = require("../models/Pottery");
const PotteryOrder = require("../models/PotteryOrder");
const PurchasedPottery = require("../models/PurchasedPottery");
const Client = require("../models/Client");
const Material = require("../models/Material");
const OrderMaterial = require("../models/OrderMaterial");
const { authenticateClient, authenticateWorker } = require("../tools/auth");
const { body, validationResult, Result } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const e = require('express');

const myValidationResult = validationResult.withDefaults({
  formatter: error => {
      return {
          message: error.msg,
      };
  },
});

router.get('/orderConfirmForm', authenticateClient, async function(req, res, next) {

  let orderType = req.query.orderType;
  let total = req.query.total;
  var deliveryTypesP = Order.getDeliveryTypes();
  var PaymentTypesP = Payment.getPaymentTypes();

  if(orderType == 2) //pirkimo
  {
    
    Promise.all([deliveryTypesP, PaymentTypesP]).then(values => {
      return res.render('clients/orderConfirm', { layout: './layouts/clientLayout', auth: true, delivery: values[0], payments: values[1], price: total, email: req.user.email });
    }).catch(err => { console.log(err); return res.sendStatus(500) })
  }else{
    return res.sendStatus(400);
  }
});

router.post('/individualOrderConfirmForm', authenticateClient, async function(req, res, next) {
  //let orderType = req.body.orderType;
  var orderDetails = {
    potteryType: req.body.potteryType,
    amount: req.body.amount,
    comment: req.body.comment
  }
  var deliveryTypesP = Order.getDeliveryTypes();
  var PaymentTypesP = Payment.getPaymentTypes();
  var potteryTypePriceP = Pottery.getTypePrice(req.body.potteryType);
  
    if(req.files != null){
      var userPhoto = req.files.userPhoto;
      savePhoto(userPhoto).then(photoId => {
        orderDetails.photo = photoId;
        Promise.all([deliveryTypesP, PaymentTypesP, potteryTypePriceP]).then(values => {
          return res.render('clients/individualOrderConfirm', { layout: './layouts/clientLayout', auth: true, delivery: values[0], payments: values[1], price: (values[2].price * req.body.amount).toFixed(2), orderDetails: JSON.stringify(orderDetails) });
        })
        .catch(err => { console.log(err); return res.sendStatus(500) })
      })
    }else{
      orderDetails.photo = req.body.photo;
      Promise.all([deliveryTypesP, PaymentTypesP, potteryTypePriceP]).then(values => {
      return res.render('clients/individualOrderConfirm', { layout: './layouts/clientLayout', auth: true, delivery: values[0], payments: values[1], price: (values[2].price * req.body.amount).toFixed(2), orderDetails: JSON.stringify(orderDetails) });
      }).catch(err => { console.log(err); return res.sendStatus(500) })
    }
});

router.post('/createOrder', authenticateClient, function(req, res, next) {

  let orderType = req.body.orderType;
  let paymentType = req.body.paymentType;
  let total = req.body.total;
  let orderId;
  var totalToCents = (req.body.total * 100).toFixed(2);
  let stripePublicKey = process.env.STRIPE_PUBLIC;
  if(orderType == 2){  //purchase order
    
    
    Client.getById(req.user.id).then(client => { return Order.save(total, req.body.city, req.body.address, req.body.postalCode, 1, orderType, req.body.deliveryType, req.user.id, client.phone)})
    .then(gotOrderId => { orderId = gotOrderId; return PurchasedPottery.save(gotOrderId, req.body.basket); })
    .then(() => { 
      if(paymentType == 1){
        return res.render('clients/payment', { layout: './layouts/clientLayout', auth: true, stripePublicKey: stripePublicKey, price: totalToCents, orderId: orderId, paymentType: req.body.paymentType, email: req.user.email }); 
      }else{
        Payment.save(total, paymentType, "", orderId)
        .then( () => { return res.redirect("/") })
        .catch(error => { console.log(error); return res.sendStatus(500) });
      }
      
    })
    .catch(err => { console.log(err); return res.sendStatus(500) })
  }else if(orderType == 1){ //individual order
    let orderDetails = JSON.parse(req.body.orderDetails);
    Client.getById(req.user.id).then(client => { return Order.save(total, req.body.city, req.body.address, req.body.postalCode, 1, orderType, req.body.deliveryType, req.user.id, client.phone)})
    .then(gotOrderId => { orderId = gotOrderId; return PotteryOrder.save(orderDetails.comment, orderDetails.potteryType, orderDetails.amount, gotOrderId, orderDetails.photo) })
    .then(() => {
      return res.redirect("/")
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

router.get('/paymentSelectionForm', authenticateClient, function (req, res, next) {
  let orderId = req.query.orderId;
  Order.getById(orderId).then(order => {
      return res.render('orders/paymentSelectionForm', { layout: './layouts/clientLayout', auth: true, email: req.user.email, order: order }); 
  })

});

router.post('/makePayment', authenticateClient, function (req, res, next) {
  let stripePublicKey = process.env.STRIPE_PUBLIC;
  let totalToCents = (req.body.total * 100).toFixed(2);
  let orderId = req.body.orderId;
  let paymentType = req.body.paymentType;
  if(paymentType == 1){
    return res.render('clients/payment', { layout: './layouts/clientLayout', auth: true, stripePublicKey: stripePublicKey, price: totalToCents, orderId: orderId, paymentType: paymentType, email: req.user.email }); 
  }else{
    Payment.save(req.body.total, paymentType, "", orderId)
    .then( () => { return res.redirect("/") })
    .catch(error => { console.log(error); return res.sendStatus(500) });
  }
});

router.get('/ordersList', authenticateWorker, function(req, res, next) {
  var filter = 0;
  var page = 1;
  if(req.query.id != undefined){
    Order.getFullOrderDetailsById(req.query.id).then(order => {
      return res.render('orders/ordersList', { layout: './layouts/workerLayout', orders: order, filter: filter, page: page, active: 3  }); 
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
  }else{
    if(req.query.filter != undefined){
      filter = req.query.filter;
    }
    if(req.query.page != undefined){
      page = req.query.page;
    }
    Order.getFullOrderDetails(filter, page - 1).then(orderList => {
        return res.render('orders/ordersList', { layout: './layouts/workerLayout', orders: orderList, filter: filter, page: page, active: 3  }); 
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
  }
});

router.get('/orderInfo', authenticateWorker, function(req, res, next) {

  var orderId = req.query.orderId;
  var orderType = req.query.orderType;
  var orderState = req.query.orderState;
  if(orderType == 1){
    //individualus
    let matterialsP = Material.getAll();
    let potteryOrderP = PotteryOrder.get(orderId);
    Promise.all([potteryOrderP, matterialsP]).then(values => {
        if(orderState == 'patvirtintas'){
          OrderMaterial.getByPotteryOrder(values[0].id).then(orderMaterials => {
            return res.render('orders/individualOrderInfo', { layout: './layouts/workerLayout', potteryOrder: values[0], materials: values[1], orderMaterials: orderMaterials, orderId: orderId, state: orderState, active: 3 });
          })
        }else{
          return res.render('orders/individualOrderInfo', { layout: './layouts/workerLayout', potteryOrder: values[0], materials: values[1], orderId: orderId, state: orderState, active: 3 });
        }
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
  }else if(orderType == 2){
    //pirkimo
    PurchasedPottery.get(orderId).then(items => {
        return res.render('orders/purchaseOrderInfo', { layout: './layouts/workerLayout', items: items, orderId: orderId, state: orderState, active: 3 });
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
  }else{
    return res.sendStatus(400);
  }

});

async function checkBalances(value, amounts, potteryAmount){
  if(typeof value != 'undefined'){
    for(let i = 0, length = value.length; i < length; i++){
        var matBalance = await Material.getMaterialBalance(value[i]);
        if(matBalance.amount - (amounts[i] * potteryAmount).toFixed(2) < 0){
          return false;
        }
      }
      return true;
  }else{
    return true;
  }
  
}

router.post('/approveOrder', [
  body('materials', "turi būti pasirinkta nors viena medžiaga").notEmpty(),
  body('materials').custom((value, { req }) => {
  
    return checkBalances(value, req.body.amounts, req.body.potteryAmount).then(result => {
      if(!result){
        return Promise.reject('vienos ar daugiau medžiagos neužtenka');
      }
    });

})], authenticateWorker, function(req, res, next) {

  const hasErrors = !myValidationResult(req).isEmpty();

  if (hasErrors) {  // form has errors
      const errorsList = myValidationResult(req).array();
      console.log(errorsList)
      var orderId = req.body.orderId;

      let matterialsP = Material.getAll();
      let potteryOrderP = PotteryOrder.get(orderId);
        Promise.all([potteryOrderP, matterialsP]).then(values => {
              return res.render('orders/individualOrderInfo', { layout: './layouts/workerLayout', errorsList: errorsList, selectedMaterials: req.body.materials, amounts: req.body.amounts, potteryOrder: values[0], materials: values[1], orderId: orderId, state: 'naujas', active: 3 });
        })
        .catch(error => { console.log(error); return res.sendStatus(500) })
  }
  else {
    var id = req.body.orderId;
    var potteryOrderId = req.body.potteryOrderId;
    var state = 4;
    var potteryAmount = req.body.potteryAmount;
    
    Order.updateState(id, state)
    .then(() => {
      return saveOrderMaterials(req.body.materials, req.body.amounts, potteryAmount, potteryOrderId)  
    }).then(()=>{
      return res.redirect("/orders/ordersList"); 
    })
    .catch(err => { console.log(err); return res.sendStatus(500) })
    }
});

router.get('/clientOrderInfo', authenticateClient, function(req, res, next) {

  var orderId = req.query.orderId;
  var orderType = req.query.orderType;
  var orderState = req.query.orderState;
  if(orderType == 1){
    //individualus
    let potteryOrderP = PotteryOrder.get(orderId);
    let paymentMadeP = Payment.isPaymentMade(orderId);
    Promise.all([potteryOrderP, paymentMadeP]).then(values => {
          return res.render('orders/clientIndividualOrderInfo', { layout: './layouts/clientLayout', auth: true, potteryOrder: values[0], paymentMade: values[1].paymentMade, orderId: orderId, state: orderState, email: req.user.email });
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
  }else if(orderType == 2){
    //pirkimo
    let purchasedPotteryP = PurchasedPottery.get(orderId)
    let paymentMadeP = Payment.isPaymentMade(orderId);
    Promise.all([purchasedPotteryP, paymentMadeP]).then(values => {
        return res.render('orders/clientPurchaseOrderInfo', { layout: './layouts/clientLayout', auth: true, items: values[0], paymentMade: values[1].paymentMade, orderId: orderId, state: orderState, email: req.user.email });
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
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


function savePhoto(file){

  return new Promise(function(resolve, reject){

    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
      let photoName = uuidv4();
      uploadPath = __dirname + '/../public/images/' + photoName + ".jpg";
      file.mv(uploadPath, function (err) {   
        if (err)
          reject(err);
        else{
          Photo.save("/static/images/" + photoName + ".jpg", -1).then(photoId => {
            resolve(photoId);
          }).catch(err => reject(err));
        }
      }); 
    }else{
      reject("wrong file format");
    }
  });
}

function saveOrderMaterials(materialsIds, amounts, potteryAmount, orderId) {

  return new Promise((resolve, reject) => {

    if (materialsIds && amounts) {

      for (let i = 0; i < materialsIds.length; i++) {
        OrderMaterial.save(materialsIds[i], amounts[i], orderId)
        .then(() => Material.subtractAmount(materialsIds[i], (amounts[i] * potteryAmount).toFixed(2)))
        .catch(err => { throw err });
      }

      resolve("materials saved")

    } else {
      reject(`error while saving  (id # ${orderId}) - material or amounts array is empty`);
    }

  });
}

module.exports = router;


