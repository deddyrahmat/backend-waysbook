const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');
const {uploadFile} = require('../middlewares/uploadFile');

router.post('/', uploadFile('thumbnail','bookAttachment') ,bookController.create);//uploadFile('thumbnail','bookAttachment')nama parameter harus sama dengan nama model di database, sesuai dengan form input dan sama dengan yang ada di midleware

module.exports = router