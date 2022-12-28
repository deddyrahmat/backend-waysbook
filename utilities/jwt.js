const jwt = require('jsonwebtoken');
require('dotenv').config();
const createError = require('http-errors')

function signAccessToken(data) {
    return new Promise((resolve, reject) => {
        const option = {
            expiresIn: '1h'
        }
    
        jwt.sign(data, process.env.JWT_SECRET, option, (err, token) => {
            // console.log('token', token)
            if (err) {
                reject(createError.InternalServerError(err))
                return
            }
    
            return resolve(token);
    
        });  
    })

}

function signRefreshToken(data) {
    return new Promise((resolve, reject) => {
        const option = {
            expiresIn: '90s'
        }
    
        jwt.sign(data, process.env.REFRESH_JWT_SECRET, option, (err, token) => {
            // console.log('token', token)
            if (err) {
                 reject(createError.InternalServerError(err))
                 return
            }
    
            return resolve(token);
    
        });  
    })

}

module.exports = {signAccessToken, signRefreshToken}