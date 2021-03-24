const express = require('express');
const router = express.Router();
const { authenticate } = require("../tools/auth");
const Material = require("../models/Material");
const Pottery = require("../models/Pottery");
const { check, validationResult, Result } = require('express-validator');

const myValidationResult = validationResult.withDefaults({
  formatter: error => {
    return {
      message: error.msg,
    };
  },
});

router.get('/', authenticate, function (req, res, next) {
  res.render('inventory/workerHomeView', { layout: './layouts/workerLayout' });
});

router.get('/pottery', function (req, res, next) {
  res.render('inventory/potteryList', { layout: './layouts/workerLayout' });
});

router.get('/potteryCreateForm', authenticate, function (req, res, next) {
  var potteryTypesP = Pottery.getTypes();
  var matterialsP = Material.getAll();

  Promise.all([potteryTypesP, matterialsP]).then(values => {
    return res.render('inventory/potteryCreateForm', { layout: './layouts/workerLayout', fields: {}, types: values[0], materials: values[1] });

  }).catch(err => { console.log(err); return res.sendStatus(500) })

});

router.post('/potteryCreate', authenticate, [
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

router.get('/potteryUpdateForm', function (req, res, next) {
  res.send('pottery edit form');
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
        uploadPath = __dirname + '/../uploads/' + photo.name;
        photo.mv(uploadPath, function (err) {    //save photo to a folder
          if (err)
            reject(err)
        });
        Pottery.savePhoto(uploadPath, potteryId).catch(err => { throw err }); // save photo url to a database
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
        Material.savePotteryMaterial(materials[i], amounts[i], potteryId).catch(err => { throw err });
      }

      resolve("materials saved")

    } else {
      reject(`error while saving pottery (id # ${potteryId}) material - material or amounts array is empty`);
    }

  });
}


module.exports = router;
