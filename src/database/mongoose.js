const mongoose = require('mongoose');

mongoose
  .connect('mongodb://127.0.0.1:27017/login_page', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .catch(err => console.log(err));

mongoose.connection.on('error', err => {
  logError(err);
});
