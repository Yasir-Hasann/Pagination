// module imports
const express = require('express');

// file imports
const { getData1, getData2, getData3, getData4, setData } = require('../controllers/user');

// variable initializations
const router = express.Router();

router.get('/1', getData1);
router.get('/2', getData2);
router.get('/3', getData3);
router.get('/4', getData4);
router.post('/', setData);

module.exports = router;
