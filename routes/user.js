const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const middlewareAuth = require('../middlewares/auth')

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh', userController.refreshTokenJwt);

module.exports = router