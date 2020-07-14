const mongoose = require("mongoose");
const Task = require("./taskmodel");

const workSchema = new mongoose.Schema({
	workid: {
		type: String,
		unique: true,
		trim: true,
		require: true,
	},
	work_title: {
		type: String,
		trim: true,
	},
	work_selected: {
		type: Number,
		default: 0,
	},
	work_created: {
		type: String,
	},
	work_deadline: {
		type: String,
	},
	userid: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
});

workSchema.virtual("mytask", {
	ref: "Task",
	localField: "_id",
	foreignField: "workid_backend",
});

workSchema.statics.selecthim = async (userid, workid) => {
	const work = await Work.findOne({
		userid: userid,
		_id: workid,
	});
	if (!work) {
		throw new Error("no work found to update");
	}
	var a = await Work.updateMany({userid: userid}, {Selected: false});
	a = await Work.updateOne({userid: userid, _id: workid}, {Selected: true});
	const datalist = Work.find({userid: userid});
	return datalist;
};

workSchema.pre("remove", async function (next) {
	const work = this;
	await Task.deleteMany({workid_backend: work._id});
	next();
});

const Work = mongoose.model("Work", workSchema);

module.exports = Work;
