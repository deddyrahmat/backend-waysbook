const {Book, Bestseller, Bookuser, User} = require('../models');
const Validator = require('fastest-validator');
const slugify = require('slugify');
const { schemaCreateBook } = require('../utilities/validation_schema');

const v = new Validator();

function create(req, res) {
    // console.log('req.files', req.files)
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

    const check = v.validate( data, schemaCreateBook);
    if (check !== true) {
        res.status(200).json({
            status : 0,
            message : check[0].message
        })
    }else {
        Book.create({
            ...data,
            book_attachment : req.files.bookAttachment[0].path,
            cloudinary_id_book_attachment : req.files.bookAttachment[0].filename,
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
    const currentPage = parseInt(req.query.page) || 1;

    // default hanya 5 data yang di tampilkan 
    const perPage = parseInt(req.query.perPage) || 5;

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
        if (result.rows.length === 0 ) {
            res.status(200).json({
                status : 1,
                message : "Data Books Not Found",
                data : result.rows,
                total_data : result.count,
                per_page : perPage,
                current_page : currentPage
            })
        }
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
    // console.log("data", req.user)
    Book.findOne({
        where : {slug : req.params.slug},
        attributes: { 
            exclude: ['cloudinary_id_bookAttachment','cloudinary_id_thumbnail','createdAt','updatedAt'] 
        }
    }).then(result => {

        if (!result) {
            res.status(200).json({
                status : 1,
                message : "Data Books Not Found",
                data : result
            })
        }
        
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

function bestSeller(req, res) {
    Bestseller.findAll({
        attributes:{
            exclude : ["createdAt","updatedAt", "BookId"]
        },
        include : [
            {
                model : Book,
                as : "book",
                attributes:{
                    exclude:["createdAt","updatedAt","cloudinary_id_book_attachment","cloudinary_id_thumbnail"]
                }
            }
        ],
        order: [
            ['total', 'DESC']
        ],
        limit : 5,
    }).then((result) => {
        if (result.length === 0) {
            return res.status(200).json({
                status : 1,
                message : "Data Empty",
                data : null
            })
        }
        return res.status(200).json({
            status : 1,
            message : "Load Data Success",
            data : result
        })
    }).catch(err => {
        return res.status(500).json({
            status : 0,
            message : err
        })
    })
}

function purchased(req, res) {
    // console.log('req.user', req.user.id)
    User.findAndCountAll({
        where : {
            id : req.user.id
        },  
        attributes : ['createdAt'],
        include : [
            {
                model : Book,
                attributes:{
                    exclude:["createdAt","updatedAt","cloudinary_id_book_attachment","cloudinary_id_thumbnail"]
                },
                through: {
                    attributes: [],
                },
            }
        ],
        order: [
            ['createdAt', 'DESC']
        ],
        limit : 5,
    }).then((result) => {
        if (result.length === 0) {
            return res.status(200).json({
                status : 1,
                message : "Data Empty",
                data : null
            })
        }
        return res.status(200).json({
            status : 1,
            message : "Load Data Success",
            data : result
        })
    }).catch(err => {
        return res.status(500).json({
            status : 0,
            message : err.name
        })
    })
}

module.exports = {create, getBooks, getBookById, bestSeller, purchased}