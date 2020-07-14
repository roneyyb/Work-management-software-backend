const mongoose = require('mongoose');

const imageSchema  = new mongoose.Schema({
    image_id: {
        type: String,
        require: true,
        trim: true    
    },
    task_id: {
        type: String,
        require: true,
        trim: true
    },
    type: {
        type: String,
        require: true,
        trim: true,
    },
    taskid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Tasks'
    }
})

