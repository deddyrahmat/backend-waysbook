const jwt = require('jsonwebtoken');
require('dotenv').config();

const {User} = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;

function auth(req, res, next) {
    const authHeader = req.headers;
    // console.log('authHeader', authHeader)

    if (authHeader) {
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
        return res.status(403).json({
            status : 0,
            message : "Expired Token"
        })
    }
}

function isAdmin(req, res, next) {
    // menangkap data req user dari auth sebelumnya
    // console.log('req.user', req.user)
    if(!req.user){
        return res.status(400).json({
            status : 0,
            error : {
                message : "No Token. Authorization Denied"
            }
        });
    }

    User.findOne({where : {id : req.user.id}}).then(
        (result) => {
            if (result.role !== req.user.role) {
                return res.status(400).json({
                    status : 0,
                    message : "User Not Found ! Admin Authorization Denied"
                })
            }

            next()
        }
    ).catch(() => {
        return res.status(400).json({
            status : 0,
            error : {
                message : "User Not Found ! Admin Authorization Denied"
            }
        });
    });
}

module.exports = {auth, isAdmin}