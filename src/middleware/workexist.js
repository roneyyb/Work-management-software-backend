const Work = require('../database/worklistmodel');

const workexist = async (req, res, next) => {
  const workid = req.header('Authorization');
  const userid = req.header('userid');
  console.log('id', workid, userid);
  try {
    console.log(Work);
    const exist = await Work.findOne({ _id: workid, owners: userid });
    console.log('work exist =>', exist);
    if (!exist) {
      return res.status(404).send({ error: 'Work id do not exist' });
    }
    req.work = exist;
    //console.log(exist);
    next();
  } catch (e) {
    res.status(400).send({ error: 'problem occured in server' });
  }
};

module.exports = workexist;
