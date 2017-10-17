var config = require('./../../config.json');
var express = require('express');
var router = express.Router();
var userService = require('./user.service');
var randomstring = require('randomstring');
var jwt = require('express-jwt');
var jwt_decode = require('jwt-decode');

router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/:_id', get);
router.put('/:_id', update);
router.delete('/:_id', _delete);
router.post('/resetpassword', resetPassword);

module.exports = router;

function authenticate(req, res) {
    userService.authenticate(req.body.email, req.body.password)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.status(400).send('Username or password incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function register(req, res) {
    userService.create(req.body)
        .then(function () {
            res.status(200).json({});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    console.log('hey');
    userService.getAll()
        .then(function (users) {
            res.send(users);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function get(req, res) {
    userService.getById(req.params._id)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {
    userService.update(req.params._id, req.body)
        .then(function () {
            res.status(200).json({});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {
    userService.delete(req.params._id)
        .then(function () {
            res.status(200).json({});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function resetPassword(req, res) {
    var app = require('express')(),
        mailer = require('express-mailer');
    app.set('view engine', 'jade');

    mailer.extend(app, {
        from: 'Task Management',
        host: 'smtp.gmail.com',
        secureConnection: true,
        port: 465,
        transportMethod: 'SMTP',
        auth: {
            user: 'uts.aip.2017@gmail.com',
            pass: 'dkTlqkfrhkwpwhwrkxek',
            otherProperty: 'other prperty'
        }
    });

    userService.getByEmail(req.body.email)
        .then(function (user) {
            if (user) {
                user.password = randomstring.generate(6);
                userService.update(req.params._id, user);
                sendMail(user, user.password);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send("error here");
        });

    function sendMail(user, password) {
        
        app.mailer.send('email', {
            to: user.email,
            subject: 'Password Reset',
            password: password,
        }, function (err, message) {
            if (err) {
                res.send("problem here");
            }
            console.log('sent');
            res.status(200).send('Email sent');
        });
    }
}