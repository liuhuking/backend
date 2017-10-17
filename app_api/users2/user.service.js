var config = require('./../../config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var bcrypt = require('bcryptjs');
var emailValidator = require('email-validator');
db.bind('users');

var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.getByEmail = getByEmail;

module.exports = service;

function authenticate(email, password) {
    var deferred = Q.defer();

    db.users.findOne({ email: email }, function (err, user) {
        if (err) {
            deferred.reject(err.name + ': ' + err.message);
        }

        if (user && bcrypt.compareSync(password, user.hash)) {
            deferred.resolve({
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                token: jwt.sign({ sub: user._id }, config.secret)
            });
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    db.users.find().toArray(function (err, users) {
        if (err) {
            deferred.reject(err.name + ': ' + err.message);
        }

        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });

        deferred.resolve(users);
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) {
            deferred.reject(err.name + ': ' + err.message);
        }

        if (user) {
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();

    db.users.findOne(
        { email: userParam.email },
        function (err, user) {
            if (err) {
                deferred.reject(err.name + ': ' + err.message);
            }

            if (user) {
                deferred.reject('email taken');
            } else {
                if (validateInput()) {
                    createUser();
                } else {
                    deferred.reject('invalid input');
                }
            }
        }
    );

    function createUser() {
        var user = _.omit(userParam, 'password');

        user.hash = bcrypt.hashSync(userParam.password, 10);

        db.users.insert(
            user,
            function (err, doc) {
                if (err) {
                    deferred.reject(err.name + ': ' + err.message);
                }
                deferred.resolve();
            }
        );
    }

    function validateInput() {
        if (!emailValidator.validate(userParam.email)) {
            return false;
        }

        var nameRegEx = /^[A-Za-z]+$/;
        if (!nameRegEx.test(userParam.firstName) || !nameRegEx.test(userParam.lastName)) {
            return false;
        }

        if (!/^.{6,}/.test(userParam.password)) {
            return false;
        }
        return true;
    }

    return deferred.promise;
}

function getByEmail(email) {
    var deferred = Q.defer();

    db.users.findOne(
        { email: email },
        function (err, user) {
            if (err) {
                deferred.reject(err.name + ': ' + err.message);
            }

            if (user) {
                deferred.resolve(user);
            } else {
                deferred.reject('user does not exist');
            }
        }
    );
    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) {
            deferred.reject(err.name + ': ' + err.message);
        }

        if (user) {
            updateUser();
        } else {
            deferred.reject("User not found");
        }
    });

    function updateUser() {
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
            role: userParam.role
        }

        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) {
                    deferred.reject(err.name + ': ' + err.message);
                }
                deferred.resolve();
            }
        );
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) {
                deferred.reject(err.name + ': ' + err.message);
            }

            deferred.resolve();
        }
    );

    return deferred.promise;
}