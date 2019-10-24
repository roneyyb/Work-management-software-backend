const Work = require('../database/worklistmodel');

const workcheck = async (req, res, next) => {
  const id = req.header('Authorization');
  console.log('id', id);
  try {
    const exist = await Work.findOne({ _id:id });
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

module.exports = workcheck;
