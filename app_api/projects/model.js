var mongoose = require('mongoose');

var projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    priority: {
        type: Number,
        required: true,
        default: 1
    },
    description: {
        type: String
    },
    taskId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{
    timestamps: true
});

projectSchema.methods.setPassword = function(password) {
};

mongoose.model('Project', projectSchema);