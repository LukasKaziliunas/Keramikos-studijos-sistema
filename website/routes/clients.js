var express = require('express');
var router = express.Router();
const Pottery = require("../models/Pottery");
const Photo = require("../models/Photo");
const Material = require("../models/Material");
const { authenticateClient } = require("../tools/auth");

/* GET users listing. */
router.get('/', function (req, res, next) {
  // user not authorized
  Pottery.getGalleryItems().then(galleryItems => { return res.render('clients/gallery', { layout: './layouts/clientLayout', auth: false, items: galleryItems }); })
  .catch(error => { console.log(error); return res.sendStatus(400) })
});

router.get('/basket', authenticateClient, function (req, res, next) {
  return res.render('clients/basket', { layout: './layouts/clientLayout', auth: true });
});

router.get('/options', authenticateClient, function (req, res, next) {
  res.send('options view');
});

router.get('/gallery', authenticateClient, function (req, res, next) {

    //user authorized
    Pottery.getGalleryItems().then(galleryItems => { return res.render('clients/gallery', { layout: './layouts/clientLayout', auth: true, items: galleryItems }); })
      .catch(error => { console.log(error); return res.sendStatus(400) })

});

router.get('/potteryinfo/:id', function (req, res, next) {
  let pottery;
  Pottery.getById(req.params.id)
  .then(gotPottery => {
    pottery = gotPottery;
    return Photo.getPotteryPhotos(pottery.id)
  })
  .then(photos => {
    return res.render('clients/potteryInfo', { layout:  './layouts/clientLayout', auth: true, pottery: pottery, photos: photos });
  })
});

router.get('/orderCreateForm', authenticateClient, function (req, res, next) {
  let getClayP = Material.getClay();
  let getGlazeP = Material.getGlaze();
  let getPottereyTypes = Pottery.getTypes();
  Promise.all([getClayP, getGlazeP, getPottereyTypes]).then(values => {
    return res.render('clients/orderCreateForm', { layout:  './layouts/clientLayout', auth: true, clays: values[0], glazes: values[1], potteryTypes: values[2]  });
  }).catch(err => { console.log(err); return res.sendStatus(500) })
});

module.exports = router;
