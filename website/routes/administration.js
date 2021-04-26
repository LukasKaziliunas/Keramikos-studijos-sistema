const express = require('express');
const router = express.Router();
const { check, validationResult, Result } = require('express-validator');
const { authenticateAdmin } = require("../tools/auth");
const Material = require("../models/Material");
const Supplier = require("../models/Supplier");
const Client = require("../models/Client");

const myValidationResult = validationResult.withDefaults({
  formatter: error => {
      return {
          message: error.msg,
      };
  },
});

/* GET users listing. */
router.get('/', authenticateAdmin, function (req, res, next) {
  res.render('administration/adminHomeView', { layout: './layouts/adminLayout', auth: true });
});

//returns supplier form
router.get('/supplierCreateForm', authenticateAdmin, function (req, res, next) {
  res.render('administration/supplierCreateForm', { layout: './layouts/adminLayout', fields: {} });
});

//gets supplier's data and saves it
router.post('/supplierCreate', authenticateAdmin, [
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

router.get('/supplierUpdateForm', authenticateAdmin, function (req, res, next) {
  res.send('supplier edit form page');
});

router.get('/suppliers', function (req, res, next) {
  res.render('administration/manageSuppliers', { layout: './layouts/adminLayout' });
});

router.get('/users', function (req, res, next) {
  res.render('administration/manageUsers', { layout: './layouts/adminLayout' });
});

router.get('/getUsers', function (req, res, next) {
  var id = req.query.id;
  var name = req.query.name;
  var lastName = req.query.lname;
  var page = req.query.page;
  Client.getClients(id, name, lastName, page - 1).then(clients => {
    res.json(clients);
  })
  .catch(error => { console.log(error); res.sendStatus(500) })
});



module.exports = router;
