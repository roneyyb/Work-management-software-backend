const express = require("express");
const User = require("../database/usermodel");
const Work = require("../database/worklistmodel");

const Defaultid = require("../database/defaultworkmodelid");
const router = new express.Router();
const auth = require("../middleware/auth");

router.post("/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(
			req.body.email,
			req.body.password,
		);
		var defaultwork = await Work.findOne({
			work_selected: 1,
			userid: user._id,
		});
		const defaultid = await Defaultid.findOne({userid: user.id});
		var defaultworks = {
			workid_backend: defaultwork._id,
			workid: defaultwork.workid,
			work_selected: defaultwork.work_selected,
			_id: defaultwork._id,
			work_title: defaultwork.work_title,
			work_description: defaultwork.work_description,
			userid: defaultwork.userid,
			work_created: defaultwork.work_created,
			work_deadline: defaultwork.work_deadline,
		};

		res.send({
			email: user.email,
			id: user._id,
			username: user.username,
			defaultwork: defaultworks,
			defaultworkid: defaultid.workid,
		});
	} catch (error) {
		res.status(400).send({error});
	}
});

router.post("/signup", auth, async (req, res) => {
	const user = new User(req.body);
	try {
		console.log("some one tried to fetch");
		await user.save();
		const work = await new Work({
			work_title: "My Board",
			userid: user._id,
			work_selected: 1,
			work_created: req.header("date"),
			work_deadline: "",
			work_description: "",
			workid: req.header("defaultworkid"),
		});
		await work.save();

		const defaultid = await new Defaultid({
			userid: user._id,
			workid: work._id,
		});
		await defaultid.save();
		const defaultwork = work;
		var defaultworks = {
			workid_backend: defaultwork._id,
			workid: defaultwork.workid,
			work_selected: defaultwork.work_selected,
			_id: defaultwork._id,
			work_title: defaultwork.work_title,
			work_description: defaultwork.work_description,
			userid: defaultwork.userid,
			work_created: defaultwork.work_created,
			work_deadline: defaultwork.work_deadline,
		};
		return res.status(201).send({user, work: defaultworks});
	} catch (e) {
		console.log(e);
		return res.status(400).send({error: e});
	}
});

module.exports = router;
