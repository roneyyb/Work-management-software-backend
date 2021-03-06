const express = require('express');
require("dotenv").config();

require('./src/database/mongoose');

const User = require('./src/Route/userroute');
const Task = require('./src/Route/taskroute');
const Work = require('./src/Route/workroute');

const app = express();
app.use(express.json());
app.use(User);
app.use(Task);
app.use(Work);
const port = process.env.PORT || 3000;

app.listen(port, console.log(`Server started on ${port}`));