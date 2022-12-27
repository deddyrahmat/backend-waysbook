const {User} = require('../models');
const Validator = require('fastest-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { token } = require('morgan');

require('dotenv').config;
const v = new Validator();

function register(req, res, next) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            User.findOne({where : {email : req.body.email}}).then((resultUser) => {
                // console.log('resultUser', resultUser)

                if (resultUser) {
                    return res.status(403).json({
                        status : 0,
                        message : "Email already exist"
                    });
                }

                const data = {
                    fullname : req.body.fullname,
                    password : hash,
                    email : req.body.email,
                    role : "user"
                }
    
                const schema = {
                    fullname: { type: "string",min: 3, max: 100, optional:false },
                    email: { type: "email",min: 3, max: 100, optional:false },
                    password: { type: "string",min: 20, max: 255, optional:false },
                };

                const check = v.validate(data, schema);
                // console.log('check', check)
                if (check !== true) { 
                    res.status(403).json({
                        status : 0,
                        message : check
                    })
                }
                else {
                    User.create(data).then(() => {
                        res.status(200).json({
                            status : 1,
                            message : "Register Success"
                        })
                    }).catch(err => {
                        res.status(500).json({
                            status : 0,
                            message : err
                        })
                    });
                }
            }).catch(err => {
                res.status(500).json({
                    status : 0,
                    message : "Server Error"
                })
            })
            
        });
    });
}

function login(req, res, next) {
    User.findOne({
        where : {email : req.body.email},
        attributes: { exclude: ['createdAt','updatedAt'] }
    }).then(result => {
        // console.log('result', result.password);
        if (!result) {
            res.status(403).json({
                status : 0,
                message : "Email or password invalid"
            });
        }else {
            bcrypt.compare(req.body.password, result.password, function(err, resultPass) {
                if (resultPass) {

                    const option = {
                        expiresIn: '50s'
                    }

                    const signLogin = jwt.sign({ 
                        id : result.id,
                        fullname : result.fullname,
                        avatar : result.avatar,
                        email : result.email,
                        role : result.role
                     }, process.env.JWT_SECRET, option);

                    const signRefresh = jwt.sign({ 
                        id : result.id,
                        fullname : result.fullname,
                        avatar : result.avatar,
                        email : result.email,
                        role : result.role
                     }, process.env.REFRESH_JWT_SECRET, {expiresIn: '1h'});

                     // jika funcction tanpa err, result token jadi null
                        // console.log('err', err);
                        if (!signLogin) {
                            res.status(403).json({
                                status : 0,
                                message : signLogin
                            })
                        }

                         res.status(200).json({
                             status : 1,
                             message : "Login Success",
                             token : signLogin,
                             refresh_token : signRefresh,
                             data : {
                                 id : result.id,
                                 fullname : result.fullname,
                                 avatar : result.avatar,
                                 email : result.email,
                                 role : result.role
                             }
                         });
                }else{
                    res.status(403).json({
                        status : 0,
                        message : "Email or password invalid"
                    });
                }
            });
        }
    }).catch(err=> {
        res.status(403).json({
            status : 0,
            message : "Email or password invalid"
        });
    });
}

function refreshTokenJwt(req, res, next) {
    const authHeader = req.headers;
    if (authHeader) {
        // console.log('authHeader', authHeader)
        // jika ada headers authorization yang dikirimkan
        const token = authHeader.authorization.split(' ')[1];
        const resultRefresh = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
        if (!resultRefresh) {
            return res.status(401).json({
                status : 0,
                message : resultRefresh
            })
        }

        const option = {
            expiresIn: '50s'
        }
        
        const signLogin = jwt.sign({ 
            id : resultRefresh.id,
            fullname : resultRefresh.fullname,
            avatar : resultRefresh.avatar,
            email : resultRefresh.email,
            role : resultRefresh.role
         }, process.env.JWT_SECRET, option);

        const signRefresh = jwt.sign({ 
            id : resultRefresh.id,
            fullname : resultRefresh.fullname,
            avatar : resultRefresh.avatar,
            email : resultRefresh.email,
            role : resultRefresh.role
         }, process.env.REFRESH_JWT_SECRET, {expiresIn: '1h'});

         // jika funcction tanpa err, result token jadi null
            // console.log('err', err);
            if (!signLogin) {
                res.status(401).json({
                    status : 0,
                    message : signLogin
                })
            }

             res.status(200).json({
                 status : 1,
                 message : "Login Success",
                 token : signLogin,
                 refresh_token : signRefresh,
                 data : {
                     id : resultRefresh.id,
                     fullname : resultRefresh.fullname,
                     avatar : resultRefresh.avatar,
                     email : resultRefresh.email,
                     role : resultRefresh.role
                 }
             });
    }

}

module.exports = {register, login, refreshTokenJwt}