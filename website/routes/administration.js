const express = require('express');
const router = express.Router();
const { check, validationResult, Result } = require('express-validator');
const { authenticateAdmin, authenticateWorker } = require("../tools/auth");
const Material = require("../models/Material");
const Supplier = require("../models/Supplier");
const Client = require("../models/Client");
const Worker = require("../models/Worker");
const User = require("../models/User");
const Pottery = require("../models/Pottery");
const bcrypt = require('bcrypt')

const myValidationResult = validationResult.withDefaults({
  formatter: error => {
      return {
          message: error.msg,
      };
  },
});

/* GET users listing. */
router.get('/', authenticateAdmin, function (req, res, next) {
  res.render('administration/manageUsers', { layout: './layouts/adminLayout', active: 1 });
});

//returns supplier form
router.get('/supplierCreateForm', authenticateAdmin, function (req, res, next) {
  res.render('administration/supplierCreateForm', { layout: './layouts/adminLayout', fields: {}, active: 2 });
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
    res.render('administration/supplierCreateForm', { layout: './layouts/adminLayout', fields: req.body, errorsList: errorsList, active: 2  });
  }
  else {
    //saves the supplier
    Supplier.save(req.body.name, req.body.email, req.body.phone)
    .then(()=> res.redirect('/administration/suppliers'))
    .catch(error => { console.log(error); res.sendStatus(500) })
  }
});

router.get('/supplierUpdateForm', authenticateAdmin, function (req, res, next) {
  Supplier.getById(req.query.id).then(supplier => {
    res.render('administration/supplierEditForm', { layout: './layouts/adminLayout', fields: supplier, supplierId: req.query.id, active: 2  });
  })
});

router.post('/supplierEdit', authenticateAdmin, [
  check('name', 'neįvestas pavadinimas').notEmpty(),
  check('email', 'neįvestas el. paštas').notEmpty(),
  check('phone', 'neįvestas telefonas').notEmpty()
], function (req, res, next) {

  const hasErrors = !myValidationResult(req).isEmpty();

  if (hasErrors) {
    //returns form with errors
    const errorsList = myValidationResult(req).array();
    res.render('administration/supplierEditForm', { layout: './layouts/adminLayout', fields: req.body, supplierId: req.body.id, errorsList: errorsList, active: 2  });
  }
  else {
    console.log(req.body)
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let id = req.body.id;
    Supplier.update(name, email, phone, id).then(() => {
      res.redirect('/administration/suppliers');
    })
    .catch(error => { console.log(error); res.sendStatus(500) })
  }
});

router.get('/supplierDelete', authenticateAdmin, function (req, res, next) {
  console.log(req.query)
  Supplier.delete(req.query.id).then(() => {
    res.sendStatus(200);
  })
  .catch(error => { console.log(error); res.sendStatus(500) })
});

router.get('/suppliers', authenticateAdmin, function (req, res, next) {
  Supplier.getAll().then(suppliers => {
      res.render('administration/manageSuppliers', { layout: './layouts/adminLayout', suppliers: suppliers, active: 2 });
  })
  .catch(error => { console.log(error); return res.sendStatus(500) })
});


router.get('/userEditForm', authenticateAdmin, function (req, res, next) {
  let userId = req.query.id;
  let getUserP = User.getById(userId);
  let getClientP = Client.getById(userId);
  Promise.all([getUserP, getClientP]).then(values => {
    let user = {
      name: values[1].name,
      lname: values[1].lastname,
      phone: values[1].phone,
      email: values[0].email,
      userId: userId
    }
    return res.render('administration/userEditForm', { layout: './layouts/adminLayout', fields: user, active: 1 });
  })
  .catch(error => { console.log(error); return res.sendStatus(500) })
});

router.post('/userEdit', authenticateAdmin, [
  check('name', 'neįvestas vardas').notEmpty(),
  check('lname', 'neįvesta pavardė').notEmpty(),
  check('phone', 'neįvestas telefonas').notEmpty(),
  check('email', 'neįvestas el. paštas').notEmpty()
], function (req, res, next) {

  const hasErrors = !myValidationResult(req).isEmpty();

  if (hasErrors) {
    //returns form with errors
    const errorsList = myValidationResult(req).array();
    return res.render('administration/userEditForm', { layout: './layouts/adminLayout', errorsList: errorsList, fields: req.body, active: 1 });
  }
  else {
    let updateUserP = User.updateEmail(req.body.userId, req.body.email);
    let updateClientP = Client.update(req.body.name, req.body.lname, req.body.phone, req.body.userId);
    Promise.all([updateUserP, updateClientP]).then(values => {
      return res.render('administration/manageUsers', { layout: './layouts/adminLayout', active: 1 });
    })
    .catch(error => { console.log(error); return res.sendStatus(500) })
  }
});

router.get('/users', authenticateAdmin, function (req, res, next) {
  return res.render('administration/manageUsers', { layout: './layouts/adminLayout', active: 1 });
});

router.get('/workerCreateForm', authenticateAdmin, function (req, res, next) {
  return res.render('administration/workerCreateForm', { layout: './layouts/adminLayout', fields: {}, active: 1 });
});

router.post('/workerCreate', authenticateAdmin, [
  check('name', 'neįvestas pavadinimas').notEmpty(),
  check('email', 'neįvestas el. paštas').notEmpty(),
  check('password', 'neįvestas slaptaždis').notEmpty(),
  check('password', 'slaptažodis per trumpas, turi būti nors 8 simboliai').isLength({ min: 8 }),
], function (req, res, next) {

  const hasErrors = !myValidationResult(req).isEmpty();

    if (hasErrors) {  // form has errors
        const errorsList = myValidationResult(req).array();
        res.render('administration/workerCreateForm', { layout: './layouts/adminLayout', errorsList: errorsList, fields: req.body, active: 1 });
    }else{
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password;

        bcrypt.genSalt(5)
        .then(salt => bcrypt.hash(password, salt))
        .then(hash => User.save(email, hash, '2'))
        .then(userId => Worker.save(name, userId))
        .then(() => { return res.render('administration/manageUsers', { layout: './layouts/adminLayout', active: 1 }); })
        .catch(error => { console.log(error); res.sendStatus(500) })
    }
});

router.get('/managePotteryTypes', authenticateAdmin, function (req, res, next) {
  Pottery.getTypes().then(types => {
    return res.render('administration/managePotteryTypes', { layout: './layouts/adminLayout', types: types, active: 3 });
  })
  
});

router.get('/potteryTypeCreateForm', authenticateAdmin, function (req, res, next) {
   return res.render('administration/potteryTypeCreateForm', { layout: './layouts/adminLayout', fields: {}, active: 3 });
});

router.get('/potteryTypeEditForm', authenticateAdmin, function (req, res, next) {
  let id = req.query.id;
  Pottery.getTypeById(id).then(potteryType => {
    return res.render('administration/potteryTypeEditForm', { layout: './layouts/adminLayout', fields: potteryType, typeId: id, active: 3 });
  })
  .catch(error => { console.log(error); res.sendStatus(500) })
});

router.post('/potteryTypeEdit', [
  check('name', 'neivestas pavadinimas').notEmpty(),
  check('price', 'neivesta kaina').notEmpty(),
  check('price', 'kaina negali būti neigiama arba lygi nuliui').isFloat({min: 0.01})
], authenticateAdmin, function (req, res, next) {
  const hasErrors = !myValidationResult(req).isEmpty();

    if (hasErrors) {  // form has errors
      const errorsList = myValidationResult(req).array();
      return res.render('administration/potteryTypeEditForm', { layout: './layouts/adminLayout', errorsList: errorsList, fields: req.body, active: 3 });
    }else{
      let name = req.body.name;
      let price = req.body.price;
      let id = req.body.id;
      Pottery.updatePotteryType(name, price, id).then(() => {
        return res.redirect('managePotteryTypes');
      })
      .catch(error => { console.log(error); res.sendStatus(500) })
    }
});

router.post('/potteryTypeCreate', authenticateAdmin, [
  check('name', 'neivestas pavadinimas').notEmpty(),
  check('price', 'neivesta kaina').notEmpty(),
  check('price', 'kaina negali būti neigiama arba lygi nuliui').isFloat({min: 0.01})
], function (req, res, next) {
  const hasErrors = !myValidationResult(req).isEmpty();

    if (hasErrors) {  // form has errors
      const errorsList = myValidationResult(req).array();
      return res.render('administration/potteryTypeCreateForm', { layout: './layouts/adminLayout', errorsList: errorsList, fields: req.body, active: 3 });
    }else{
      let name = req.body.name;
      let price = req.body.price;
      Pottery.savePotteryType(name, price).then(() => {
        return res.redirect('managePotteryTypes');
      })
      .catch(error => { console.log(error); return res.sendStatus(500) })
    }
});

router.get('/potteryTypeDelete', authenticateAdmin, function (req, res, next) {
  let id = req.query.id;
  Pottery.deletePotteryType(id).then(() => { return res.sendStatus(200)})
  .catch(error => { console.log(error); return res.sendStatus(500) })
});

router.get('/getUsers', function (req, res, next) {
  var id = req.query.id;
  var name = req.query.name;
  var lastName = req.query.lname;
  var phone = req.query.phone;
  var page = req.query.page;
  Client.getClients(id, name, lastName, phone, page - 1).then(clients => {
    res.json(clients);
  })
  .catch(error => { console.log(error); res.sendStatus(500) })
});



module.exports = router;
