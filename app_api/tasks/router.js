//Load express module
var express = require('express');

//Get the instance of router
var router = express.Router();

//Connect to the mongoDB 
var mongoose = require('mongoose');

//Import moment to work
var moment = require('moment');

//Improt modgodb to work
var mongodb = require("mongodb");

//Creadt new ojbectID  
var ObjectID = mongodb.ObjectID;


var Task = mongoose.model('Task');
var jwt_decode = require('jwt-decode');

//task home page router
router.get('/gettasks', getAll);
router.get('/gettasksfrom/:id', getAllFrom);
router.get('/gettask/:id', getSelected)
router.post('/add', add);
router.put('/edit', edit);
router.delete('/remove/:id', remove);
// router.delete('/removeGroup', removeGroup);

function getAll(req, res) {
    var userId = getUserIdFromRequestHeader(req);

    Task.find({
        userId: userId
    }).exec(function (err, task) {
        res.status(200).json(task);
    });
}

function getAllFrom(req, res) {
    Task.find({
        userId: new ObjectID(req.params.id)})
        .populate('userId')
        .exec(function (err, task) {
            res.status(200).json(task);
        })
}

function getSelected(req, res) {
    if (!req.params.id) {
        res.status(400).json({
            "message": "Invalid key for searching task"
        });
    } else {
        Task.findById(new ObjectID(req.params.id)).exec(function (err, task) {
            if (err) {
                res.status(400).send('error');
            }

            var requestingUserId = getUserIdFromRequestHeader(req);
            if (requestingUserId != task.userId) {
                res.status(401).send("Unauthorized access");
            } else {
                res.status(200).json(task);
            }
        });
    }
}

function add(req, res) {
    var task = new Task();
    task.name = req.body.name;

    //TO-DO: Create a method to parse directly
    var dateString = moment(req.body.date, 'DD/MM/YYYY');
    var formattedDate = dateString.format('YYYY/MM/DD');
    task.date = formattedDate;

    task.goal = req.body.goal;
    task.deliverable = req.body.deliverable;

    //TO-DO: Create a method to parse directly
    var timeString, formattedTime;
    timeString = moment(req.body.startTime, 'H:mm');
    formattedTime = timeString.format('YYYY/MM/DD H:mm');
    task.startTime = formattedTime;

    timeString = moment(req.body.endTime, 'H:mm');
    formattedTime = timeString.format('YYYY/MM/DD H:mm');

    task.endTime = formattedTime;
    userId = getUserIdFromRequestHeader(req);
    task.userId = new ObjectID(userId);
    
    task.process = req.body.process;

    task.save(function (err) {
        res.status(200);
        res.json({
            "message": "Task Saved"
        });
    });
};

function edit(req, res) {
    var updateDoc = req.body;
    var id = new ObjectID(req.body._id);
    delete updateDoc._id;

    var dateString = moment(updateDoc.date, 'DD/MM/YYYY');
    var formattedDate = dateString.format('YYYY/MM/DD');
    updateDoc.date = formattedDate;

    var timeString, formattedTime;
    timeString = moment(updateDoc.startTime, 'H:mm');
    formattedTime = timeString.format('YYYY/MM/DD H:mm');
    updateDoc.startTime = formattedTime;

    timeString = moment(updateDoc.endTime, 'H:mm');
    formattedTime = timeString.format('YYYY/MM/DD H:mm');
    updateDoc.endTime = formattedTime;

    Task.updateOne({ _id: id }, updateDoc, function (err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to update contact");
        } else {
            updateDoc._id = req.body._id;
            res.status(200).json(updateDoc);
        }
    });
}

function remove(req, res) {
    Task.deleteOne({ _id: new ObjectID(req.params.id) }, function (err, result) {
        if (err) {
            handleError(res, err.message, "Failed to delete task");
        } else {
            res.status(200).json(req.params.id);
        }
    });
}

function htmlEscape(item) {
    if (typeof item === 'string' || item instanceof String) {
        return item.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    else if (item && typeof item === 'object' && item.constructor === Array) {
        item.forEach(function (element) {
            element = htmlEscape(element);
        }, this);
    }
    else {
        return item;
    }
}

function getUserIdFromRequestHeader(req) {
    var token = req.headers.authorization.split(' ')[1];
    var userId = jwt_decode(token).sub;
    return userId;
}

module.exports = router;