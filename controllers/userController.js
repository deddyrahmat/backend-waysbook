const {User} = require('../models');
const Validator = require('fastest-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

module.exports = {register}