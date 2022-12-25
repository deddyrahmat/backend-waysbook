const {Book} = require('../models');
const Validator = require('fastest-validator');
const slugify = require('slugify')

const v = new Validator();

function create(req, res, next) {
    const schema = {
        title: {type : "string" ,min: 3, max: 150, optional:false},
        thumbnail: {type : "string" ,min: 3, max: 100, optional:false},
        author: {type : "string" ,min: 3, max: 50, optional:false},
        price: {type: "number", positive: true, integer: true, optional:false},
        publication: {type : "string", optional:false},
        pages: {type : "string" ,min: 1, max: 4, optional:false},
        isbn: {type : "string" ,min: 10, max: 17, optional:false},
        short_desc: {type : "string" ,min: 3, max: 150, optional:false},
        bookAttachment: {type : "string" ,min: 5, max: 150, optional:false}
    }

    const data = {
        slug : slugify(req.body.title, {replacement: '-', lower: false}),
        title : req.body.title,
        thumbnail : req.body.thumbnail,
        author : req.body.author,
        price : req.body.price,
        publication : req.body.publication,
        pages : req.body.pages,
        isbn : req.body.isbn,
        short_desc : req.body.short_desc,
        bookAttachment : req.body.bookAttachment,
    }

    const check = v.validate( data, schema);
    if (check !== true) {
        res.status(400).json({
            status : 0,
            message : check
        })
    }else {
        Book.create(data).then(() => {
            res.status(200).json({
                status : 1,
                message : "Success Created Book"
            })
        }).catch((err) => {
            res.status(500).json({
                status : 0,
                message : err
            })
        });
    }
    
}

module.exports = {create}