const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error-handler');
const apiRouter = require('./routes');

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Mount routes
app.use('/api/v1', apiRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});