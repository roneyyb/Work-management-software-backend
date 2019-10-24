const Work = require('../database/worklistmodel');

const checkworkid = async (req, res, next) => {
  try {
    const exist = await Work.findOne({ _id: req.params.id });
    if (!exist) {
      throw new Error({ error: 'Work does not exist' });
    }
    req.work = exist;
    next();
  } catch (e) {
    console.log(e);
    return res.status(400).send({ e });
  }
};

module.exports = checkworkid;
