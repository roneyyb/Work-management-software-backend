const User = require('../database/usermodel');

const accountcheck = async (req, res, next) => {
  const id = req.header('Authorization');
  console.log('id', id);
  try {
    const exist = await User.findOne({ _id: id });
    console.log('exist =>', exist);
    if (!exist) {
      return res.status(404).send({ error: 'Please authenticate' });
    }
    req.user = exist;
    //console.log(exist);
    next();
  } catch (e) {
    console.log(e);
    res.status(400).send({ error: 'Please authenticate' });
  }
};

module.exports = accountcheck;
