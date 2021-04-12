const express = require('express');
const router = express.Router();
const { authenticateWorker } = require("../tools/auth");
const Material = require("../models/Material");
const Pottery = require("../models/Pottery");
const PotteryMaterial = require("../models/PotteryMaterial");
const Photo = require("../models/Photo")
const { check, validationResult, Result } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const myValidationResult = validationResult.withDefaults({
  formatter: error => {
    return {
      message: error.msg,
    };
  },
});

router.get('/', authenticateWorker, function (req, res, next) {
  res.render('inventory/workerHomeView', { layout: './layouts/workerLayout' });
});

router.get('/potteryList', authenticateWorker, function (req, res, next) {
  res.render('inventory/potteryList', { layout: './layouts/workerLayout' });
});

router.get('/potteryCreateForm', authenticateWorker, function (req, res, next) {
  var potteryTypesP = Pottery.getTypes();
  var matterialsP = Material.getAll();

  Promise.all([potteryTypesP, matterialsP]).then(values => {
    return res.render('inventory/potteryCreateForm', { layout: './layouts/workerLayout', fields: {}, types: values[0], materials: values[1] });

  }).catch(err => { console.log(err); return res.sendStatus(500) })

});

router.post('/potteryCreate', authenticateWorker, [
  check('name', 'neįvestas pavadinimas').notEmpty(),
  check('price', 'neįvestas kaina').notEmpty(),
  check('materials', 'nepasirinktos madiagos').notEmpty(),
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
    Pottery.save(req.body.name, req.body.price, req.body.description, req.body.type)    //save pottery
      .then(gotPotteryId => {
        
          let promises = [savePotteryMaterials(req.body.materials, req.body.amounts, gotPotteryId), savePhotos(req.files, gotPotteryId)]
          Promise.all(promises)
          .then(result => {console.log(result) ; return res.render('inventory/workerHomeView', { layout: './layouts/workerLayout' });})
          .catch(err => {console.log(err) ; return res.render('inventory/workerHomeView', { layout: './layouts/workerLayout' });})  
      })
  }

});

router.get('/potteryUpdateForm', authenticateWorker, function (req, res, next) {
  res.send('pottery edit form');
});

//returs material create form
router.get('/materialCreateForm', authenticateWorker, function (req, res, next) {
  Supplier.getAllCompact()
  .then(suppliers => res.render('administration/materialCreateForm', { layout: './layouts/adminLayout', suppliers: suppliers, fields: {} }))
  .catch(error => { console.log(error); res.sendStatus(500) })
});

//gets material data and saves it
router.post('/materialCreate', authenticateWorker, [
  check('name', 'neįvestas pavadinimas').notEmpty(),
  check('amount', 'neįvestas kiekis').notEmpty(),
  check('price', 'neįvesta kaina').notEmpty(),
  check('supplier', 'nepasirinktas tiekejas').notEmpty(),
], function (req, res, next) {

  const hasErrors = !myValidationResult(req).isEmpty();

  if (hasErrors) {
    //returns material create form with errors
    const errorsList = myValidationResult(req).array();
    Supplier.getAllCompact()
    .then(suppliers => res.render('administration/materialCreateForm', { layout: './layouts/adminLayout', suppliers: suppliers, fields: req.body, errorsList: errorsList }))
    .catch(error => { console.log(error); res.sendStatus(500) })
  }
  else {
    //saves the material
    Material.save(req.body.name, req.body.amount, req.body.price, req.body.supplier)
    .then(()=> res.redirect('/administration'))
    .catch(error => { console.log(error); res.sendStatus(500) })
  }
});

router.get('/matterialUpdateForm', authenticateWorker, function (req, res, next) {
  res.send('matterial edit form');
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
        let photoName = uuidv4();
        uploadPath = __dirname + '/../public/images/' + photoName + ".jpg";
        photo.mv(uploadPath, function (err) {    //save photo to a folder
          if (err)
            reject(err)
        });
        Photo.save("/static/images/" + photoName + ".jpg", potteryId).catch(err => { throw err }); // save photo path to a database
      })
      resolve("photos saves")
    } else {
      reject("no photos")
    }
  });
}

function savePotteryMaterials(materials, amounts, potteryId) {

  return new Promise((resolve, reject) => {

    if (materials && amounts) {

      //turn into array if its not already, so i can iterate
      if (!Array.isArray(materials))
        materials = [materials];

      if (!Array.isArray(amounts))
        amounts = [amounts];

      for (let i = 0; i < materials.length; i++) {
        PotteryMaterial.save(materials[i], amounts[i], potteryId).catch(err => { throw err });
      }

      resolve("materials saved")

    } else {
      reject(`error while saving pottery (id # ${potteryId}) material - material or amounts array is empty`);
    }

  });
}


module.exports = router;
