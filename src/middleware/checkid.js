const User = require('../database/usermodel');

const checkid = async (req, res, next) => {
  try {
    console.log('user', req.params.id);
    const exist = await User.findOne({ _id: req.params.id });
    //console.log('exist =>', exist);
    if (!exist) {
      throw new Error({ error: 'User does not exist' });
    }
    req.user = exist;
    next();
  } catch (e) {
    console.log(e);
    return res.status(400).send({ error: e });
  }
};

module.exports = checkid;
