// module imports
const express = require('express');

// file imports
const user = require('./user');

// variable initializations
const router = express.Router();

router.use('/user', user);

module.exports = router;
