var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var emailValidator = require('email-validator');
var auth = jwt({
    secret: 'SECRET',
    userProperty: 'payload'
});
var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.content(content);
};

router.get('/profile', auth, profileRead);
router.post('/register', register);
router.post('/login', login);

function register(req, res) {
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email;

    user.setPassword(req.body.password);

    if(emailValidator.validate(user.email)){
        user.save(function(err) {
            var token;
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token": token
            });
        });
    } else {
        res.json({
            "message": "Invalid value for email field"
        });
    }
};

function login(req, res) {
    passport.authenticate('local', function(err, user, info) {
        var token;

        if (err) {
            res.status(404).json(err);
            return;
        }

        if(user) {
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token": token
            });
        } else {
            res.status(401).json(info);
        }
    })(req, res);
};

function profileRead(req, res) {
    if(!req.payload._id){
        res.status(401).json({
            "message": "Unauthorized error: private profile"
        });
    } else {
        User.findById(req.payload._id).exec(function(err, user){
            res.status(200).json(user);
        });
    }
}

module.exports = router;