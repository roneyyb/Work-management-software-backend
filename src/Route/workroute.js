const express = require('express');
const checkid = require('../middleware/checkid');
const Work = require('../database/worklistmodel');
const workcheck = require('../middleware/workcheck');
const accountcheck = require('../middleware/accountcheck');
const Defaultid = require('../database/defaultworkmodelid');

const workexist = require('../middleware/workexist');
const router = new express.Router();

router.post('/creatework/:id', checkid, async (req, res) => {
  const work = new Work({ ...req.body, owners: req.params.id });
  console.log('new work', req.body, work);
  try {
    console.log('i');
    await work.save();
    console.log('work');
    const data = await Work.selecthim(req.params.id, work._id);
    console.log('data =>', data);
    res.status(200).send({ data, work });
  } catch (e) {
    console.log('e =>', e);
    res.status(400).send({ error: e });
  }
});

router.delete('/workdelete', workexist, async (req, res) => {
  const userid = req.header('userid');
  const match = {};
  const sort = {};
  const update = {};
  console.log(req.query.completed);
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    console.log('parts =>', parts);
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    console.log(sort);
  }
  if (req.query.updatedBy) {
    const parts = req.query.updatedBy.split(':');
    updated[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  //console.log(req.work, match, req.query);

  try {
    console.log('userid => ', userid);
    await req.work.remove();
    const defaultid = await Defaultid.findOne({ userid });
    console.log('defaultid delete', defaultid);
    const data = await Work.selecthim(userid, defaultid.workid);
    console.log('data', data);
    const selectedwork = await data.find(item => item.Selected === true);
    console.log('selectedwork =>', selectedwork);
    await selectedwork
      .populate({
        path: 'mytask',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
          update
        }
      })
      .execPopulate();
    console.log('work removed');
    res
      .status(200)
      .send({
        work: selectedwork,
        worklist: data,
        tasklist: selectedwork.mytask
      });
  } catch (e) {
    res.status(500).send({ error: e });
  }
});

router.get('/worklistget', accountcheck, async (req, res) => {
  try {
    await req.user
      .populate({
        path: 'mywork'
      })
      .execPopulate();
    console.log('work returned =>', req.user.mywork);
    res.status(200).send({ message: req.user.mywork });
  } catch (e) {
    res.status(404).send({ error: e });
  }
});

router.patch('/workupdate/:id', accountcheck, async (req, res) => {
  try {
    console.log('work update request', req.body);
    console.log('req.user+>', req.user);
    await Work.updateOne(
      {
        owners: req.user._id,
        _id: req.params.id
      },
      { work: req.body.work },
      (error, response) => {
        if (response) {
          console.log('response =>', response);
        }
        if (error) {
          console.log('error =>', error);
        }
      }
    );
    await req.user
      .populate({
        path: 'mywork'
      })
      .execPopulate();
    console.log('work returned =>', req.user.mywork);

    const work = await Work.findOne({
      owners: req.user._id,
      _id: req.params.id,
      Selected: true
    });
    console.log('selectedwork =>', work);
    res.status(200).send({ work, worklist: req.user.mywork });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'server problem' });
  }
});
router.patch('/worklistupdate/:id', accountcheck, async (req, res) => {
  // const allowedUpdate = ['work', 'Selected'];
  // console.log('worklistupdate => ', req.body);
  // const updates = Object.keys(req.body);
  // const isValidUpdate = updates.every(u => allowedUpdate.includes(u));
  // if (!isValidUpdate) return res.status(400).send({ error: 'invalid update' });
  try {
    console.log('update');
    const data = await Work.selecthim(req.user._id, req.params.id);
    console.log(data);
    const selectedwork = data.find(item => item.Selected == true);
    console.log('selectedwork', selectedwork);
    res.send({ data, selectedwork });
  } catch (e) {
    console.log('error', e);
    res.status(400).send(e);
  }
});

module.exports = router;
