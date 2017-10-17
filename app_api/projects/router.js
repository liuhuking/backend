var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var Project = mongoose.model('Project');

router.get('/getprojects/:id', getAll);
router.get('/getproject/:id', getSelected)
router.post('/add', add);
router.put('/edit', edit);
router.delete('/remove/:id', remove);
// router.delete('/removeGroup', removeGroup);

function getAll(req, res) {
    // if(!req.userId){
    //     res.status(401).json({
    //         "message": "Unauthorized error: private profile"
    //     });
    // } else {
        // Task.findById(req.userId).exec(function(err, user){
        //     res.status(200).json(user);
        // });
        // Project.find().exec(function(err, task){
        //     res.status(200).json(task);
        // });

        Project.find({
            userId : new ObjectID(req.params.id)
          })
         .populate('userId')
         .exec(function(err, project){
            res.status(200).json(project);
        });
    // }
}

function getSelected(req, res) {
    if(!req.params.id){
        res.status(401).json({
            "message": "Invalid key for searching task"
        });
    } else {
        Project.findById(new ObjectID(req.params.id)).exec(function(err, project){
            res.status(200).json(project);
        });
    }
}

function add(req, res) {
    var project = new Project();
    project.name = req.body.name;
    project.priority = req.body.priority;
    project.description = req.body.description;
    project.userId = new ObjectID(req.body.userId);

    project.save(function(err) {
        res.status(200);
        res.json({
            "message": "Project Saved"
        });
    });
};

function edit(req, res) {
    var updateDoc = req.body;
    var id = new ObjectID(req.body._id);
    delete updateDoc._id;

    Project.updateOne({_id: id}, updateDoc, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to update contact");
      } else {
        updateDoc._id = req.body._id;
        res.status(200).json(updateDoc);
      }
    });
}

function remove(req, res) {
    Project.deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
        if (err) {
          handleError(res, err.message, "Failed to delete task");
        } else {
          res.status(200).json(req.params.id);
        }
    });
}

module.exports = router;