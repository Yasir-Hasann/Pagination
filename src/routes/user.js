const express = require('express');
const { getData1, getData2, getData3, getData4, setData } = require('../controllers/user');

const router = express.Router();

router.get('/1', getData1);
router.get('/2', getData2);
router.get('/3', getData3);
router.get('/4', getData4);
router.post('/', setData);

module.exports = router;
