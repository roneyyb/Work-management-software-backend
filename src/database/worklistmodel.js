const mongoose = require('mongoose');
const Task = require('./taskmodel');

const workSchema = mongoose.Schema(
  {
    work: {
      type: String,
      trim: true,
      require: true
    },
    owners: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    Selected: {
      type: Boolean,
      default: false
      //require: true
    }
  },
  {
    timestamps: true
  }
);

workSchema.virtual('mytask', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
});

workSchema.statics.selecthim = async (userid, workid) => {
  const work = await Work.findOne({
    owners: userid,
    _id: workid
  });
  if (!work) {
    throw new Error('no work found to update');
  }
  var a = await Work.updateMany({ owners: userid }, { Selected: false });
  a = await Work.updateOne({ owners: userid, _id: workid }, { Selected: true });
  const datalist = Work.find({ owners: userid });
  return datalist;
};

workSchema.pre('remove', async function(next) {
  const work = this;
   await Task.deleteMany({owner: work._id });
   next();
});

const Work = mongoose.model('Work', workSchema);

module.exports = Work;
