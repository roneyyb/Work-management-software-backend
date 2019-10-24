const mongoose = require('mongoose');
//const Work  = require('./worklistmodel');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Work'
    },
    completed: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

taskSchema.statics.returndata = async (workid, completed) => {
  const task = await Task.findOne({
    owner: workid
  });
  if (!task) {
    throw new Error('no task found with this workid');
  }
  console.log('return data', workid, completed);
  const data = Task.find({ owner: workid, completed });
  console.log('data', data);
  return data;
};

const Tasks = mongoose.model('Task', taskSchema);

module.exports = Tasks;
