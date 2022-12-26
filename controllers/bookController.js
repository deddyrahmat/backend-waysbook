const {Book} = require('../models');
const Validator = require('fastest-validator');
const slugify = require('slugify')

const v = new Validator();

function create(req, res) {
    // console.log('req.files', req.files)
    const schema = {
        title: {type : "string" ,min: 3, max: 150, optional:false},
        author: {type : "string", optional:false},
        price: {type: "string", min: 1, max: 6, optional:false},
        publication: {type : "string", optional:false},
        pages: {type : "string" ,min: 1, max: 4, optional:false},
        isbn: {type : "string"},
        short_desc: {type : "string" , optional:false},
        detail: {type : "string" , optional:false},
    }

    const data = {
        slug : slugify(req.body.title, {replacement: '-', lower: true}),
        title : req.body.title,
        author : req.body.author,
        price : req.body.price,
        publication : req.body.publication,
        pages : req.body.pages,
        isbn : req.body.isbn,
        short_desc : req.body.short_desc,
        detail : req.body.short_desc,
    }

    const check = v.validate( data, schema);
    if (check !== true) {
        res.status(400).json({
            status : 0,
            message : check
        })
    }else {
        Book.create({
            ...data,
            bookAttachment : req.files.bookAttachment[0].path,
            cloudinary_id_bookAttachment : req.files.bookAttachment[0].filename,
            cloudinary_id_thumbnail : req.files.thumbnail[0].filename,
            thumbnail : req.files.thumbnail[0].path,
        }).then(() => {
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

function getBooks(req, res) {
    // default halaman saat ini adalah 1
    const currentPage = req.query.page || 1;

    // default hanya 5 data yang di tampilkan 
    const perPage = req.query.perPage || 5;

    // halaman saat ini - 1, halaman 1 - 1 = 0, lalu 0 * dengan berapapun hasilnya tetap 0. maka offset di mysql di mulai dari 0 di halaman pertama
    // jika halaman saat ini adalah ke 2, maka 2 -1 = 1, lalu 1 * 5(perPage) = 5, maka offseet mysql dimulai dari 6 karna 1-5 akan di skip dan loncat ke baris ke 6
    let dataOffset = (parseInt(currentPage)-1) * parseInt(perPage);

    Book.findAndCountAll({
        attributes: { 
            exclude: ['cloudinary_id_bookAttachment','cloudinary_id_thumbnail','createdAt','updatedAt'] 
        },
        order : [
            ['title','DESC']
        ],
        offset: dataOffset,
        limit: perPage
    }).then((result) => {
        res.status(200).json({
            status : 1,
            message : "Data Books Avaiable",
            data : result.rows,
            total_data : result.count,
            per_page : perPage,
            current_page : currentPage
        })
    }).catch((err) => {
        res.status(500).json({
            status : 0,
            message : err,
        })
    });
}

function getBookById(req, res) {
    Book.findOne({
        where : {slug : req.params.slug},
        attributes: { 
            exclude: ['cloudinary_id_bookAttachment','cloudinary_id_thumbnail','createdAt','updatedAt'] 
        }
    }).then(result => {
        res.status(200).json({
            status : 1,
            message : "Data Books Avaiable",
            data : result
        })
    }).catch(err => {
        res.status(500).json({
            status : 0,
            message : err,
        })
    });
}

module.exports = {create, getBooks, getBookById}