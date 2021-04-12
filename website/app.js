var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const ejsLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var accountRouter = require('./routes/account');
var adminRouter = require('./routes/administration');
var clientsRouter = require('./routes/clients');
var inventoryRouter = require('./routes/inventory');
var ordersRouter = require('./routes/orders');
var reportsRouter = require('./routes/reports');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts); 
app.set('layout', './layouts/default.ejs'); //dafault layout
app.set('view engine', 'ejs');
///static - virtual path , public - aplankas kur yra statiniai failai
app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/account', accountRouter);
app.use('/administration', adminRouter);
app.use('/clients', clientsRouter);
app.use('/inventory', inventoryRouter);
app.use('/orders', ordersRouter);
app.use('/reports', reportsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
