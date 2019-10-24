const mongoose = require('mongoose');

const defaultidSchema = new mongoose.Schema(
    {
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Work'
        },
        workid: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }
);

const Defaultids = mongoose.model('Defaultid', defaultidSchema);

module.exports = Defaultids;
