var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost:27017';

mongoose.Promise = global.Promise;

mongoose.connect(dbURI);