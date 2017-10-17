var mongo = require('mongoskin');
var bcrypt = require('bcryptjs');
var config = require('./config.json');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');
db.users.remove({});

var hash = bcrypt.hashSync('123', 10);
db.users.insert({
    email: 'admin@admin.com',
    firstName: 'admin',
    lastName: 'admin',
    role: 'Admin',
    hash: hash
});