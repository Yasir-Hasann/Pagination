// module imports
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

// file imports
const connectDB = require('./config/db');
const apiRouter = require('./routes');
const errorHandler = require('./middlewares/error-handler');

// variable initializations
const app = express();
const port = process.env.PORT || 5001;

// connect mongodb
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// mount routes
app.use('/api/v1', apiRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
