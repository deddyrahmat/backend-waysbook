const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');
const {uploadFile} = require('../middlewares/uploadFile');
const middlewareAuth = require('../middlewares/auth')

router.post('/', middlewareAuth.auth, uploadFile('evidence') ,transactionController.create);//uploadFile('evidence')nama parameter harus sama dengan nama model di database, sesuai dengan form input dan sama dengan yang ada di midleware

module.exports = router