const mongoose = require('mongoose');
//const Work  = require('./worklistmodel');

const taskSchema = new mongoose.Schema(
  {
    workid_backend: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Work'
    }, 
    taskid: {
      type: String,
      unique: true,
      required: true
    },
    task_title: {
      type: String,
      trim: true
    },
    task_description: {
      type: String,
      trim: true
    },
    task_deadline: {
      type: String,
    },
    task_reminder:{
      type: String
    },
    task_notificationid: {
      type: Number
    },
    task_completed: {
      type: Number
    },
    workid: {
      type: String,
      required: true,
    },
    task_completedAt: {
      type: String,
      default: false
    },
    task_createdAt: {
      type: String
    },
    task_updatedAt: {
      type: String
    }
  }
);

taskSchema.statics.returndata = async (workid, completed) => {
  const task = await Task.findOne({
    workid: workid
  });
  if (!task) {
    throw new Error('no task found with this workid');
  }
  console.log('return data', workid, completed);
  const data = Task.find({ workid: workid, completed });
  console.log('data', data);
  return data;
};

const Tasks = mongoose.model('Task', taskSchema);

module.exports = Tasks;
