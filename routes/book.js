const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');
const {uploadFile} = require('../middlewares/uploadFile');
const middlewareAuth = require('../middlewares/auth')

router.get('/', bookController.getBooks);
router.get('/best-seller', bookController.bestSeller);
router.get('/purchased', middlewareAuth.auth, bookController.purchased);
router.get('/:slug', middlewareAuth.auth,bookController.getBookById);
router.post('/', middlewareAuth.auth,  uploadFile('thumbnail','bookAttachment') ,bookController.create);//uploadFile('thumbnail','bookAttachment')nama parameter harus sama dengan nama model di database, sesuai dengan form input dan sama dengan yang ada di midleware

module.exports = router