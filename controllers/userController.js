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
                    return res.status(401).json({
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
                    res.status(400).json({
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
            res.status(400).json({
                status : 0,
                message : "Email or password invalid"
            });
        }else {
            bcrypt.compare(req.body.password, result.password, function(err, resultPass) {
                if (resultPass) {

                    // handle expired, jika 401, maka logout 
                    // buat 2 token, refesh dan expired
                    // httponlycookie

                    jwt.sign({ 
                        fullname : result.fullname,
                        avatar : result.avatar,
                        email : result.email,
                        role : result.role
                     }, process.env.JWT_SECRET, (err, token) => {
                        // jika funcction tanpa err, result token jadi null
                        // console.log('err', err);
                         res.status(200).json({
                             status : 1,
                             message : "Login Success",
                             token : token,
                             data : {
                                 id : result.id,
                                 fullname : result.fullname,
                                 avatar : result.avatar,
                                 email : result.email,
                                 role : result.role
                             }
                         });
                     });
                }else{
                    res.status(400).json({
                        status : 0,
                        message : "Email or password invalid"
                    });
                }
            });
        }
    }).catch(err=> {
        res.status(400).json({
            status : 0,
            message : "Email or password invalid"
        });
    });
}

module.exports = {register, login}