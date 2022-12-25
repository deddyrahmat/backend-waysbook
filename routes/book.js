const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');

router.post('/', bookController.create);

module.exports = router