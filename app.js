var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var cors = require('cors');
var config = require('./config.json');
var expressJwt = require('express-jwt');

var index = require('./routes/index');
var users = require('./routes/users');

require('./config');
require('./app_api/users/model');
require('./app_api/users/passport');
require('./app_api/tasks/model');
require('./app_api/projects/model');

var routesApi = require('./app_api/users/router');
var routesTaskApi = require('./app_api/tasks/router');
var routesProjectApi = require('./app_api/projects/router');
var users2 = require('./app_api/users2/router');
var locationService = require('./app_api/locationService/router');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());

require('./populateDb');

var locationServicePath = /\/locationservice\//;
var getUserPath = /\/users2\/[0-9A-Za-z]+/;
app.use(expressJwt({
  secret: config.secret,
  getToken: function (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
}).unless({ path: ['/users2/authenticate', '/users2/register', '/users2/resetpassword', locationServicePath, getUserPath]}));

app.use('/', index);
app.use('/users', routesApi);
app.use('/tasks', routesTaskApi);
app.use('/projects', routesProjectApi);
app.use('/users2', users2);
app.use('/locationservice', locationService);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
