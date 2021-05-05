const express = require('express');
const router = express.Router();
const { authenticateWorker } = require("../tools/auth");
const Material = require("../models/Material");
const Pottery = require("../models/Pottery");
const PotteryMaterial = require("../models/PotteryMaterial");
const Photo = require("../models/Photo");
const Supplier = require("../models/Supplier");
const Order = require("../models/Order");
const MaterialOrder = require("../models/MaterialOrder");
const Units = require("../models/Units");
const { check, validationResult, Result } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
var fs = require('fs');
var path = require('path');
const emailer = require("../tools/emails");
var { readConfig } = require("../tools/readFiles");

const myValidationResult = validationResult.withDefaults({
  formatter: error => {
    return {
      message: error.msg,
    };
  },
});

router.get('/', authenticateWorker, function (req, res, next) {
  let newOrdersCountP = Order.getNewOrdersCount();
  let lackingMaterialsCountP = Material.getLackingMaterialsCount();
  Promise.all([newOrdersCountP, lackingMaterialsCountP]).then(values => {
    res.render('inventory/workerHomeView', { layout: './layouts/workerLayout', active: 1, newOrdersCount: values[0].count, lackingMaterialsCount: values[1].count });
  })
  .catch(err => { console.log(err); return res.sendStatus(500) })
});

router.get('/potteryList', authenticateWorker, function (req, res, next) {
  Pottery.getListItems().then(items => {
    return res.render('inventory/potteryList', { layout: './layouts/workerLayout', items: items, active: 4 });
  })
  .catch(err => { console.log(err); return res.sendStatus(500) })
  
});
// pottery create ************************
router.get('/potteryCreateForm', authenticateWorker, function (req, res, next) {
  let potteryTypesP = Pottery.getTypes();
  let matterialsP = Material.getAll();

  Promise.all([potteryTypesP, matterialsP]).then(values => {
    return res.render('inventory/potteryCreateForm', { layout: './layouts/workerLayout', fields: {}, types: values[0], materials: values[1], active: 4 });

  }).catch(err => { console.log(err); return res.sendStatus(500) })

});

router.post('/potteryCreate', authenticateWorker, [
  check('name', 'neįvestas pavadinimas').notEmpty(),
  check('price', 'neįvesta kaina').notEmpty(),
  check('materials', 'nepasirinktos madžiagos').notEmpty(),
], function (req, res, next) {

  const hasErrors = !myValidationResult(req).isEmpty();

  if (hasErrors) {
    const errorsList = myValidationResult(req).array();

    var potteryTypesP = Pottery.getTypes();
    var matterialsP = Material.getAll();

    Promise.all([potteryTypesP, matterialsP]).then(values => {
      return res.render('inventory/potteryCreateForm', { layout: './layouts/workerLayout', errorsList: errorsList, fields: req.body, types: values[0], materials: values[1] });
    }).catch(err => { console.log(err); return res.sendStatus(500) })

  }
  else { // form is valid

    let showInGallery = 0;
    if (req.body.showInGalery != undefined)
    showInGallery = 1;
    
    Pottery.save(req.body.name, req.body.price, req.body.amount, req.body.description, req.body.type, showInGallery)    //save pottery
      .then(gotPotteryId => {

        let promises = [savePotteryMaterials(req.body.materials, req.body.amounts, gotPotteryId), savePhotos(req.files, gotPotteryId)]
        Promise.all(promises)
          .then(result => { console.log(result); return res.redirect("/inventory/potteryList"); })
          .catch(err => { console.log(err); return res.redirect("/inventory/potteryList"); })
      })
      .catch(error => { console.log(error); return res.sendStatus(500) })
  }

});

// pottery update ****************
router.get('/potteryUpdateForm/:id', authenticateWorker, function (req, res, next) {
  let potteryTypesP = Pottery.getTypes();
  let potteryP = Pottery.getById(req.params.id)
  let photosP = Photo.getPotteryPhotos(req.params.id)
  let potteryMaterialsP = PotteryMaterial.getByPottery(req.params.id);
  let allMatterialsP = Material.getAll();

  Promise.all([potteryTypesP, potteryP, photosP, potteryMaterialsP, allMatterialsP]).then(values => {
     return res.render('inventory/potteryEditForm', { layout: './layouts/workerLayout', types: values[0], fields: values[1], photos: values[2], potteryMateials: values[3], allMaterials: values[4], active: 4 }) 
  })
  .catch(error => { console.log(error); return res.sendStatus(500) })
});

router.post('/potteryUpdate', authenticateWorker, function (req, res, next) {
    var name = req.body.name;
    var price = req.body.price;
    var amount = req.body.amount;
    var description = req.body.description;
    var potteryType = req.body.type;
    var potteryId = req.body.potteryId;
    var showInGallery = 0;

    if (req.body.showInGallery != undefined)
    showInGallery = 1;

    Pottery.update(name, price, amount, description, potteryType, showInGallery, potteryId)
    .then(() => {
      let promises = [];
      if(req.files != null){
        let savePhotosP = savePhotos(req.files, potteryId);
        promises.push(savePhotosP);
      }

      if(req.body.materials != undefined){
        let savePotteryMaterialsP = savePotteryMaterials(req.body.materials, req.body.amounts, potteryId);
        promises.push(savePotteryMaterialsP);
      }

      if(promises.length > 0){
        Promise.all([promises]).then(values => {
        return res.redirect("/inventory/potteryList");
        })
        .catch(error => { console.log(error); return res.sendStatus(500) })
      }else{
        return res.redirect("/inventory/potteryList");
      }
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
});
// pottery delete *********************
router.get('/potteryDelete/:id', authenticateWorker, function (req, res, next) {
  Pottery.delete(req.params.id)
  .then(() => { return res.redirect("/inventory/potteryList"); })
  .catch(error => { console.log(error); return res.sendStatus(500) })
});

// materials ******************
router.get('/manageMaterials', authenticateWorker, function (req, res, next) {
  let clayP = Material.getClay();
  let glazeP = Material.getGlaze();
  Promise.all([clayP, glazeP]).then(values => {
    return res.render('inventory/manageMaterials', { layout: './layouts/workerLayout', clays: values[0], glazes: values[1], active: 5 })
  })
    .catch(error => { console.log(error); return res.sendStatus(500) })
});

router.get('/materialsOrder', authenticateWorker, function (req, res, next) {
  let MaterialsP = Material.getAll();
  let lackingMaterials = Material.getLackingMaterials();

  Promise.all([MaterialsP, lackingMaterials]).then(values => {
    return res.render('inventory/materialsOrder', { layout: './layouts/workerLayout', allMaterials: values[0] , materials: values[1], active: 5 })
  })
  .catch(error => { console.log(error); return res.sendStatus(500) })
});

router.post('/submitMaterialsOrder', authenticateWorker, function (req, res, next) {

  var materialsIds = req.body.id;
  var prices = req.body.price;
  var orderAmounts = req.body.orderAmount;
  var units = req.body.units;
  var names = req.body.names;
  var total = 0;
  for(let i = 0; i < prices.length ; i++){
    total += prices[i] * orderAmounts[i];
  }
  total = total.toFixed(2);

  let orderId = uuidv4();

    MaterialOrder.saveMultiple(orderAmounts, prices, materialsIds, orderId)
    .then(() => {
      Supplier.getAll().then(async function(suppliers) {

        for(let i = 0; i < suppliers.length ; i++){
           await MaterialOrder.getMaterialOrdersBySupplier(orderId, suppliers[i].id).then(orders => {
              if(orders.length > 0){
                let total = 0;
                for(let i = 0; i < orders.length ; i++){
                  total += orders[i].price * 1;
                }
                total = total.toFixed(2);
                emailer.sendMaterialOrder(orders, total, suppliers[i].email);
              }
            })
        };
        return res.redirect('/inventory/manageMaterials');
      })
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
});

// material create **********************
router.get('/materialCreateForm', authenticateWorker, function (req, res, next) {

  let suppliersP = Supplier.getAll();
  let unitsP = Units.getUnits();

  Promise.all([suppliersP, unitsP]).then(values => {
    return res.render('inventory/materialCreateForm', { layout: './layouts/workerLayout', suppliers: values[0], units: values[1], fields: {}, active: 5 });
  })
  .catch(error => { console.log(error); res.sendStatus(500) })
  
});

//gets material data and saves it
router.post('/materialCreate', authenticateWorker, [
  check('name', 'neįvestas pavadinimas').notEmpty(),
  check('amount', 'neįvestas kiekis').notEmpty(),
  check('price', 'neįvesta kaina').notEmpty(),
  check('supplier', 'nepasirinktas tiekejas').notEmpty(),
  check('limit', 'neivestas limitas').notEmpty(),
], function (req, res, next) {

  const hasErrors = !myValidationResult(req).isEmpty();

  if (hasErrors) {
    //returns material create form with errors
    const errorsList = myValidationResult(req).array();
    let suppliersP = Supplier.getAll();
    let unitsP = Units.getUnits();

    Promise.all([suppliersP, unitsP]).then(values => {
      return res.render('inventory/materialCreateForm', { layout: './layouts/workerLayout', errorsList: errorsList, suppliers: values[0], units: values[1], fields: req.body });
    })
    .catch(error => { console.log(error); res.sendStatus(500) })
  }
  else {
    //saves the material
    let checkLimit = 0;
    if (req.body.checkLimit != undefined)
      checkLimit = 1;

    Material.save(req.body.name, req.body.amount, req.body.price, req.body.supplier, req.body.limit, checkLimit, req.body.materialType, req.body.unit)
      .then(() => { return res.redirect('/inventory/manageMaterials') })
      .catch(error => { console.log(error); res.sendStatus(500) })
  }
});

// material edit ********************
router.get('/materialEditForm', authenticateWorker, function (req, res, next) {

  var materialId = req.query.id;
  var suppliersP = Supplier.getAll();
  var unitsP = Units.getUnits();
  var materialP = Material.getById(materialId);

  Promise.all([materialP, suppliersP, unitsP]).then(values => {
    return res.render('inventory/materialEditForm', { layout: './layouts/workerLayout', fields: values[0], suppliers: values[1], units: values[2], materialId: materialId, active: 5 });
  })
  .catch(error => { console.log(error); res.sendStatus(500) })
});

router.post('/materialEdit', authenticateWorker, function (req, res, next) {
  
  var materialId = req.body.materialId;
  var name = req.body.name;
  var amount = req.body.amount;
  var units = req.body.unit;
  var price = req.body.price;
  var limit = req.body.limit;
  var supplier = req.body.supplier;
  var materialType = req.body.materialType;
  var checkLimit = 0;
    if (req.body.checkLimit != undefined)
      checkLimit = 1;

  Material.update(name, amount, price, limit, checkLimit, units, materialType, supplier, materialId)
  .then(() => { return res.redirect('/inventory/manageMaterials'); })
  .catch(error => { console.log(error); return res.sendStatus(500) })
  
});

//material delete
router.get('/matterialDelete', authenticateWorker, function (req, res, next) {
  console.log(req.query.id)
  Material.delete(req.query.id).then(()=>{
    return res.sendStatus(200);
  }).catch(err => { console.log(err); return res.sendStatus(500); })
});


//ajax
router.get('/getPottery/:id', function (req, res, next) {
  let pottery;
  Pottery.getById(req.params.id)
  .then(gotPottery => { pottery = gotPottery; return Photo.getOnePhoto(gotPottery.id); })
  .then(photo => {pottery.photo = photo.path; return res.json(pottery)})
  .catch( () => { return res.sendStatus(400) } )
});

router.get('/getMaterial/:id', authenticateWorker, function (req, res, next) {
  Material.getById(req.params.id)
  .then(material => {
    res.json(material);
  })
  .catch(error => { console.log(error); return res.sendStatus(500) })
});

router.get('/deletePotteryMaterial', function (req, res, next) {
  PotteryMaterial.delete(req.query.id, req.query.materialId, req.query.amount)
  .then(() => { return res.sendStatus(200) })
  .catch(err => { console.log(err); return res.sendStatus(500) });
});

router.get('/deletePhoto', function (req, res, next) {
  Photo.removePhotoFromPottery(req.query.id).then(()=>{
    return res.sendStatus(200);
  })
  .catch(err => { console.log(err); return res.sendStatus(500) });
});




//files = req.files
function savePhotos(files, potteryId) {

  return new Promise((resolve, reject) => {

    //ar yra prideta failu
    if (files && Object.keys(files).length > 0) {
      //jei failu yra

      //isimu juos i kintamaji
      let photosList = files.photos;
      //jei tik vienas failas, konvertuoju i lista
      if (!Array.isArray(photosList))
        photosList = [photosList];

      photosList.forEach(photo => {
        //console.log(photo);
        if(photo.mimetype == 'image/jpeg' || photo.mimetype == 'image/png'){
          let photoName = uuidv4();
          uploadPath = __dirname + '/../public/images/' + photoName + ".jpg";
          photo.mv(uploadPath, function (err) {    //save photo to a folder
            if (err)
              reject(err)
          });
          Photo.save("/static/images/" + photoName + ".jpg", potteryId).catch(err => { throw err }); // save photo path to a database
        }
        
      })
      resolve("photos saves")
    } else {
      Photo.save("/static/images/defaults/default.jpg", potteryId).catch(err => { reject(err) })
      .then(() => { resolve("no photos") });
    }
  });
}

function savePotteryMaterials(materialsIds, amounts, potteryId) {

  return new Promise((resolve, reject) => {

    if (materialsIds && amounts) {

      //turn into array if its not already, so i can iterate
      if (!Array.isArray(materialsIds))
      materialsIds = [materialsIds];

      if (!Array.isArray(amounts))
        amounts = [amounts];

      for (let i = 0; i < materialsIds.length; i++) {
        PotteryMaterial.save(materialsIds[i], amounts[i], potteryId)
        .then(() => Material.subtractAmount(materialsIds[i], amounts[i]))
        .catch(err => { throw err });
      }

      resolve("materials saved")

    } else {
      reject(`error while saving pottery (id # ${potteryId}) material - material or amounts array is empty`);
    }

  });
}


module.exports = router;
