const jwt = require('jsonwebtoken');
require('dotenv').config();

const {User} = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;

function auth(req, res, next) {
    const authHeader = req.headers;
    // console.log('authHeader', authHeader)

    if (authHeader && authHeader.authorization) {
        // jika ada headers authorization yang dikirimkan
        const token = authHeader.authorization.split(' ')[1];
        jwt.verify(token, JWT_SECRET, function(err, user) {
            // console.log('err',err)
            if (err) {
                return res.status(401).json({
                    status : 0,
                    message : err.message
                })
            }
    
            req.user = user;
            next();
          });
    }else {
        return res.status(200).json({
            status : 0,
            message : "No Token. Authorization Denied"
        })
    }
}

function isAdmin(req, res, next) {
    // menangkap data req user dari auth sebelumnya
    // console.log('req.user', req.user)
    if(!req.user){
        return res.status(200).json({
            status : 0,
            message : "No Token. Authorization Denied"
        });
    }

    User.findOne({where : {id : req.user.id}}).then(
        (result) => {
            // console.log('req user', req.user.role)
            // console.log('result', result.role)
            // console.log('result.role !== req.user.role', result.role !== req.user.role ? true : false)
            if (result.role !== req.user.role) {
                return res.status(200).json({
                    status : 0,
                    message : "User Not Found ! Admin Authorization Denied"
                })
            }else {
                if (result.role !== 'admin') {
                    return res.status(200).json({
                        status : 0,
                        message : "Admin Authorization Denied"
                    })
                }
            }

            next()
        }
    ).catch(() => {
        return res.status(500).json({
            status : 0,
            error : {
                message : "User Not Found ! Admin Authorization Denied"
            }
        });
    });
}

module.exports = {auth, isAdmin}