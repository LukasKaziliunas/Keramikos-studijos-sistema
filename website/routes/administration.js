const express = require('express');
const router = express.Router();
const { check, validationResult, Result } = require('express-validator');
const { authenticate } = require("../tools/auth");
const Material = require("../models/Material");
const Supplier = require("../models/Supplier");

const myValidationResult = validationResult.withDefaults({
  formatter: error => {
      return {
          message: error.msg,
      };
  },
});

/* GET users listing. */
router.get('/', authenticate, function (req, res, next) {
  res.render('administration/adminHomeView', { layout: './layouts/adminLayout', auth: true });
});

//returns supplier form
router.get('/supplierCreateForm', authenticate, function (req, res, next) {
  res.render('administration/supplierCreateForm', { layout: './layouts/adminLayout', fields: {} });
});

//gets supplier's data and saves it
router.post('/supplierCreate', [
  check('name', 'neįvestas pavadinimas').notEmpty(),
  check('email', 'neįvestas el. paštas').notEmpty(),
  check('phone', 'neįvestas telefonas').notEmpty()
], function (req, res, next) {

  const hasErrors = !myValidationResult(req).isEmpty();

  if (hasErrors) {
    //returns form with errors
    const errorsList = myValidationResult(req).array();
    res.render('administration/supplierCreateForm', { layout: './layouts/adminLayout', fields: req.body, errorsList: errorsList });
  }
  else {
    //saves the supplier
    Supplier.save(req.body.name, req.body.email, req.body.phone)
    .then(()=> res.redirect('/administration'))
    .catch(error => { console.log(error); res.sendStatus(500) })
  }
});

router.get('/supplierUpdateForm', function (req, res, next) {
  res.send('supplier edit form page');
});

router.get('/suppliers', function (req, res, next) {
  res.send('suppliers list page');
});

router.get('/users', function (req, res, next) {
  res.send('users managment page');
});

//returs material create form
router.get('/materialCreateForm', authenticate, function (req, res, next) {
  Supplier.getAllCompact()
  .then(suppliers => res.render('administration/materialCreateForm', { layout: './layouts/adminLayout', suppliers: suppliers, fields: {} }))
  .catch(error => { console.log(error); res.sendStatus(500) })
});

//gets material data and saves it
router.post('/materialCreate', [
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

router.get('/matterialUpdateForm', function (req, res, next) {
  res.send('matterial edit form');
});


module.exports = router;
