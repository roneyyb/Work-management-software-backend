const express = require("express");
const checkid = require("../middleware/checkid");
const Work = require("../database/worklistmodel");
const accountcheck = require("../middleware/accountcheck");
const Defaultid = require("../database/defaultworkmodelid");
const workexist = require("../middleware/workexist");
const router = new express.Router();

router.post("/creatework/:id", checkid, async (req, res) => {
	const work = new Work({...req.body, userid: req.params.id});
	console.log("new work", req.body, work);
	try {
		await work.save();
		const data = await Work.selecthim(req.params.id, work._id);
		res.status(200).send({data, work});
	} catch (e) {
		res.status(400).send({error: e});
	}
});

router.post("/multiworkcreate/:id", checkid, async (req, res) => {
	try {
		var a = [];
		await req.body.worklist.every((works) => {
			const {update_type, workid_backend, ...rest} = works;
			const work = new Work({...rest, userid: req.params.id});
			work.save();
			a.push({workid_backend: work._id, workid: work.workid});
			return true;
		});
		res.status(200).send({workidbackend: a, error: ""});
	} catch (error) {
		res.status(404).send({error});
	}
});

router.patch("/multiworkupdate", accountcheck, async (req, res) => {
	try {
		//console.log(req);
		await req.body.worklist.every(async (works) => {
			const {update_type, userid, workid_backend, ...rest} = works;
			const work = {...rest};
			await Work.updateOne(
				{userid: req.user._id, _id: works.workid_backend},
				{
					...work,
				},
				(error, response) => {
					if (response) {
						console.log("response =>", response);
					}
					if (error) {
						console.log("error =>", error);
					}
				},
			);
			return true;
		});
		res.status(201).send({message: "work updated", error: ""});
	} catch (error) {
		res.status(400).send({error: error});
	}
});

router.delete("/multiworkdelete", accountcheck, async (req, res) => {
	try {
		await req.body.deleteworklist.every(async (work) => {
			const works = await Work.findOne({
				userid: req.user._id,
				_id: work.workid,
			});
			if (works) {
				works.remove();
			}
		});
		res.status(200).send({message: "All work deleted", error: ""});
	} catch (error) {
		res.status(400).send({error: error});
	}
});

router.delete("/workdelete", workexist, async (req, res) => {
	const userid = req.header("userid");
	const match = {};
	const sort = {};
	const update = {};
	if (req.query.completed) {
		match.completed = req.query.completed === "true";
	}
	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(":");
		sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
	}
	if (req.query.updatedBy) {
		const parts = req.query.updatedBy.split(":");
		updated[parts[0]] = parts[1] === "desc" ? -1 : 1;
	}
	//console.log(req.work, match, req.query);

	try {
		await req.work.remove();
		const defaultid = await Defaultid.findOne({userid});
		const data = await Work.selecthim(userid, defaultid.workid);
		const selectedwork = await data.find((item) => item.Selected === true);
		await selectedwork
			.populate({
				path: "mytask",
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip),
					sort,
					update,
				},
			})
			.execPopulate();
		res.status(200).send({
			work: selectedwork,
			worklist: data,
			tasklist: selectedwork.mytask,
		});
	} catch (e) {
		res.status(500).send({error: e});
	}
});

router.get("/worklistget", accountcheck, async (req, res) => {
	try {
		await req.user
			.populate({
				path: "mywork",
			})
			.execPopulate();
		res.status(200).send({worklist: req.user.mywork});
	} catch (e) {
		res.status(404).send({error: e});
	}
});

router.patch("/workupdate/:id", accountcheck, async (req, res) => {
	try {
		await Work.updateOne(
			{
				userid: req.user._id,
				_id: req.params.id,
			},
			{work: req.body.work},
			(error, response) => {
				if (response) {
					console.log("response =>", response);
				}
				if (error) {
					console.log("error =>", error);
				}
			},
		);
		await req.user
			.populate({
				path: "mywork",
			})
			.execPopulate();
	
		const work = await Work.findOne({
			userid: req.user._id,
			_id: req.params.id,
			Selected: true,
		});
		res.status(200).send({work, worklist: req.user.mywork});
	} catch (e) {
		res.status(500).send({error: "server problem"});
	}
});
router.patch("/worklistupdate/:id", accountcheck, async (req, res) => {
	// const allowedUpdate = ['work', 'Selected'];
	// console.log('worklistupdate => ', req.body);
	// const updates = Object.keys(req.body);
	// const isValidUpdate = updates.every(u => allowedUpdate.includes(u));
	// if (!isValidUpdate) return res.status(400).send({ error: 'invalid update' });
	try {
		const data = await Work.selecthim(req.user._id, req.params.id);
		const selectedwork = data.find((item) => item.Selected == true);
		res.send({data, selectedwork});
	} catch (e) {
		res.status(400).send(e);
	}
});

module.exports = router;
