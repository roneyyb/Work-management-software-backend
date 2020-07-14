const mongoose = require('mongoose');


let mongouri = (process.env.NODE_ENV === "production")?process.env.mongouri:'mongodb://127.0.0.1:27017/login_page'

mongoose
  .connect(mongouri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connection established with MongoDB'))
  .catch(err => console.log(err));

mongoose.connection.on('error', err => {
  logError(err);
});
