const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');
const {uploadFile} = require('../middlewares/uploadFile');
const middlewareAuth = require('../middlewares/auth')

router.get('/',middlewareAuth.auth, middlewareAuth.isAdmin, transactionController.list);//uploadFile('evidence')nama parameter harus sama dengan nama model di database, sesuai dengan form input dan sama dengan yang ada di midleware
router.get('/transactions-pending',middlewareAuth.auth, transactionController.listPendingByUser);//uploadFile('evidence')nama parameter harus sama dengan nama model di database, sesuai dengan form input dan sama dengan yang ada di midleware
router.get('/transactions-cancel',middlewareAuth.auth, transactionController.listCancelByUser);//uploadFile('evidence')nama parameter harus sama dengan nama model di database, sesuai dengan form input dan sama dengan yang ada di midleware
router.post('/', middlewareAuth.auth, uploadFile('evidence') ,transactionController.create);//uploadFile('evidence')nama parameter harus sama dengan nama model di database, sesuai dengan form input dan sama dengan yang ada di midleware
router.post('/status-payment', middlewareAuth.auth, middlewareAuth.isAdmin, transactionController.changeStatus)

module.exports = router