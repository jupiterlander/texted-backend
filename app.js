const express = require("express");
const app = express();

const cors = require("cors");
const morgan = require("morgan");

const port = process.env.PORT || 1337;

//routes
const index = require('./routes/index');
const all = require('./routes/all');
const store = require('./routes/store');
const find = require('./routes/find');
const last = require('./routes/last');
const update = require('./routes/update');

//cors for x-scripting security
app.use(cors());

// don't show the log when it is test
// use morgan to log at command line
// 'combined' outputs the Apache style LOGs
process.env.NODE_ENV !== 'test'? app.use(morgan('combined')): null;

app.use(express.json());

// setup routes

app.use('/', index);
app.use('/docs', all);
app.use('/docs', store);
app.use('/docs', find);
app.use('/docs', last);
app.use('/docs', update);


// Start up server
app.listen(port, () => console.log(`Express API is listening on port ${port}!`));