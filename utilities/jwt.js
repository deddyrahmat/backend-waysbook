const jwt = require('jsonwebtoken');
require('dotenv').config();

function name(params) {
    const payload = {userId};

    const option = {
        expiresIn: '50s',
        audience: userId,
    }

    jwt.sign(payload, process.env.JWT_SECRET, option, (err, token) => {
        // jika funcction tanpa err, result token jadi null
        // console.log('err', err);
        if (err) {
            res.status(403).json({
                status : 0,
                message : err.message
            })
        }
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
}