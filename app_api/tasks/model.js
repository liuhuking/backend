// import mongoose to work on mongoDB 
var mongoose = require('mongoose');

//improt new task schema to work
var taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    goal: {
        type: String
    },
    deliverable: {
        type: [String]
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    process: {
        type: [String]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
},
{
    timestamps: true
});

mongoose.model('Task', taskSchema);