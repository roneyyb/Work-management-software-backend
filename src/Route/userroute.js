const express = require('express');
const User = require('../database/usermodel');
const Work = require('../database/worklistmodel');

const Defaultid = require('../database/defaultworkmodelid');
const router = new express.Router();
const auth = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    console.log('Credentials successfuly found and user details are =>', user);
    
    const defaultwork = await Work.findOne({ Selected: true, owners: user.id });
    //const any = await Work.findOne({owners: user.id, Selected: false });
    //console.log('any',any);
    const defaultid = await Defaultid.findOne({ userid: user.id });
    console.log('defaultwork', defaultwork, defaultid);
    console.log('response send after successful login', user, defaultwork);
    res.send({
      email: user.email,
      id: user._id,
      username: user.username,
      defaultwork,
      defaultworkid: defaultid.workid
    });
  } catch (error) {
    res.send({ error });
  }
});

router.post('/signup', auth, async (req, res) => {
  const user = new User(req.body);
  try {
    console.log('some one tried to fetch');
    await user.save();
    const work = await new Work({
      work: 'My Work',
      owners: user._id,
      Selected: true
    });
    await work.save();

    const defaultid = await new Defaultid({
      userid: user._id,
      workid: work._id
    });
    await defaultid.save();
    console.log(user);
    console.log('new created work =>', work);
    return res.status(201).send({ user, work });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ error: e });
  }
});

module.exports = router;
