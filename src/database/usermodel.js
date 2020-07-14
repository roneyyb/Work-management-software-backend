//mongoose is easy way of using mongoose where we get additonal facilities fro validation
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Work = require("./worklistmodel");

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validator(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Email is invalid");
				}
			},
		},
		username: {
			type: String,
			required: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: 7,
			validator(value) {
				if (value.toLowerCase().includes("password")) {
					throw new Error(
						'passsword invalid as it contains "Password"',
					);
				}
			},
		},
	},
	{
		timestamps: true,
	},
);

userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();
	delete userObject.password;
	delete userObject.createdAt;
	delete userObject.updatedAt;
	return userObject;
};

userSchema.virtual("mywork", {
	ref: "Work",
	localField: "_id",
	foreignField: "userid",
});

userSchema.statics.findByCredentials = async (email, password, id) => {
	const user = await User.findOne({email});
	if (!user) {
		throw new Error("Unable to login");
	}
	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw new Error("Unable to login");
	}

	return user;
};

userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next(); //it indicates that we are done with what we want to do before or after the event occurs
});

const User = mongoose.model("User", userSchema);
module.exports = User;
