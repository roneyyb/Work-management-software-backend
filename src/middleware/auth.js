const User = require('../database/usermodel');

const auth = async (req, res, next) => {
  try {
    const email = req.body.email;
    const exist = await User.findOne({ email });
    if (exist) {
      throw new Error('Email id already exist');
    }
    next();
  } catch (e) {
    res.status(401).send({ error: 'Email is already exist' });
  }
};

module.exports = auth;
