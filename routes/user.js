const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const middlewareAuth = require('../middlewares/auth');
const {uploadFile} = require('../middlewares/uploadFile');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh', userController.refreshTokenJwt);
router.patch('/', middlewareAuth.auth, userController.update);
router.patch('/avatar', middlewareAuth.auth, uploadFile('avatar'), userController.updateImage);

module.exports = router