var express = require('express');
var router = express.Router();
const Pottery = require("../models/Pottery");
const Photo = require("../models/Photo");
const Material = require("../models/Material");
const { authenticateClient, isLoggedIn } = require("../tools/auth");

/* GET users listing. */
router.get('/', function (req, res, next) {
  // user not authorized
  Pottery.getGalleryItems().then(galleryItems => { return res.render('clients/gallery', { layout: './layouts/clientLayout', auth: false, items: galleryItems }); })
  .catch(error => { console.log(error); return res.sendStatus(400) })
});

router.get('/basket', authenticateClient, function (req, res, next) {
  return res.render('clients/basket', { layout: './layouts/clientLayout', auth: true, email: req.user.email });
});

router.get('/options', authenticateClient, function (req, res, next) {
  return res.render('clients/options', { layout: './layouts/clientLayout', auth: true, email: req.user.email });
});

router.get('/gallery', authenticateClient, function (req, res, next) {

    //user authorized
    Pottery.getGalleryItems().then(galleryItems => { return res.render('clients/gallery', { layout: './layouts/clientLayout', auth: true, items: galleryItems, email: req.user.email }); })
      .catch(error => { console.log(error); return res.sendStatus(400) })

});

router.get('/potteryinfo/:id', isLoggedIn, function (req, res, next) {
  var isLoggedIn = req.isLoggedIn;  //true/false
  var userEmail;
  if(isLoggedIn){
    userEmail = req.user.email;
  }else{
    userEmail = undefined;
  }
  let pottery;
  Pottery.getById(req.params.id)
  .then(gotPottery => {
    pottery = gotPottery;
    return Photo.getPotteryPhotos(pottery.id)
  })
  .then(photos => {
    if(photos.length == 0)
    photos = [ { id: 0 , path: "/static/images/default.jpg"} ];
    return res.render('clients/potteryInfo', { layout:  './layouts/clientLayout', auth: isLoggedIn, pottery: pottery, photos: photos, email: userEmail });
  })
  .catch(error => { console.log(error); return res.sendStatus(500) })
});

router.get('/individualOrderForm', authenticateClient, function (req, res, next) {

  let getPottereyTypes = Pottery.getTypes();
  let getPhotos = Photo.getDistinctPhotos(0);
  Promise.all([getPottereyTypes, getPhotos]).then(values => {
    return res.render('clients/individualOrderForm', { layout:  './layouts/clientLayout', auth: true, potteryTypes: values[0], photos: values[1], email: req.user.email });
  }).catch(err => { console.log(err); return res.sendStatus(500) })
});

router.get('/getPotteryTypePhotos', authenticateClient, function (req, res, next) {

  let potteryType = req.query.potteryType;
  Photo.getDistinctPhotos(potteryType).then(photos => {
    res.json(photos);
  })
  .catch(err => { console.log(err); return res.sendStatus(500) })
});

module.exports = router;
