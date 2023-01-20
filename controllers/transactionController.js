const {Transaction, Booktransaction, Bookuser, Bestseller, Book, User} = require('../models');
const Validator = require('fastest-validator');
const { schemaTransactionPayment, schemaStatusPayment } = require('../utilities/validation_schema');

const v = new Validator();

function create(req, res) {
    // console.log('req.files', req.body)
    const { books } = req.body;
    const newBooks = JSON.parse(books);

    const data = {
        total : parseInt(req.body.total),
    }

    const check = v.validate( data, schemaTransactionPayment);
    if (check !== true) {
        res.status(200).json({
            status : 0,
            message : check[0].message
        })
    }else {
        Transaction.create({
            ...data,
            user_id : req.user.id,
            status : 'pending',
            cloudinary_id_evidence : req.files.evidence[0].filename,
            evidence : req.files.evidence[0].path,
        }).then((result) => {
            const dataBooks = newBooks.map(book =>  {
                return {
                    book_id : parseInt(book),
                    transaction_id : parseInt(result.dataValues.id),
                }
            });
            if (dataBooks.length > 0) {
                // console.log('dataBooks', dataBooks)
                Booktransaction.bulkCreate(dataBooks).then(() => {
                    return res.status(200).json({
                        status : 1,
                        message : "Payment Success"
                    })
                }).catch((err) => {
                    return res.status(500).json({
                        status : 0,
                        message : err
                    })
                });
            }else {
                return res.status(200).json({
                    status : 0,
                    message : "Data books for transaction not found"
                })
            }
        }).catch((err) => {
            res.status(500).json({
                status : 0,
                message : err
            })
        });
    }
    
}

async function changeStatus(req, res) {
    try {
        const { books } = req.body;

        const data = {
            status : req.body.status
        }

        const check = v.validate(data, schemaStatusPayment);
        if (!check) {
            return res.status(200).json({
                status : 0,
                message : check[0].message
            })
        }

        // console.log('status', req.body.status)
        // console.log('transacti', req.body.transaction_id)

        const resTransaction = await Transaction.update({
            status : req.body.status
        },{where : {
            id : req.body.transaction_id
        }})

        if (!resTransaction) {
            return res.status(401).json({
                status : 0,
                message : resTransaction
            })
        }

        if (req.body.status !== 'approved') {
            return res.status(200).json({
                status : 1,
                message : "Status Updated"
            })
        }
        
        const dataBooks = books.map(book =>  {
            return {
                book_id : parseInt(book),
                user_id : parseInt(req.body.user_id),
            }
        });
        const resBookUser = await Bookuser.bulkCreate(dataBooks);
        if (!resBookUser) {
            return res.status(401).json({
                status : 0,
                message : resTransaction
            })
        }

        books.forEach(async (book) => {
            const resFindBook = await Bestseller.findOne({
                where : {book_id : book},
                attributes:{
                    exclude : ["createdAt","updatedAt", "bestsellerId"]
                },
            });
            // console.log('resFindBook', resFindBook ? true : false);
            // cek buku sudah ada atau belum
            // kalo belum add data buku,kalo ada update total
            if (!resFindBook) {
                await Bestseller.create({book_id : book, total : 1});
            }else{
                await Bestseller.update({total : resFindBook.dataValues.total + 1},{where : {
                    id : resFindBook.dataValues.id
                }});
            }

        });
        return res.status(200).json({
            status : 1,
            message : "Update successfully"
        })
        
    } catch (err) {
        return res.status(500).json({
            status : 0,
            message : err
        })
        
    }


}

function list(req, res) {
    // default halaman saat ini adalah 1
    const currentPage = parseInt(req.query.page) || 1;

    // default hanya 5 data yang di tampilkan 
    const perPage = parseInt(req.query.perPage) || 5;

    // halaman saat ini - 1, halaman 1 - 1 = 0, lalu 0 * dengan berapapun hasilnya tetap 0. maka offset di mysql di mulai dari 0 di halaman pertama
    // jika halaman saat ini adalah ke 2, maka 2 -1 = 1, lalu 1 * 5(perPage) = 5, maka offseet mysql dimulai dari 6 karna 1-5 akan di skip dan loncat ke baris ke 6
    let dataOffset = (parseInt(currentPage)-1) * parseInt(perPage);

    Transaction.findAndCountAll({
        attributes: { 
            exclude: ['cloudinary_id_evidence','updatedAt','UserId'] 
        },
        include : [
            {
                model : User,
                as : "user",
                attributes:['fullname']
            },
            {
                model : Book,
                as : "booktransactions",//harus sama dengan di database
                attributes : ['id','title'],
                through: {
                    attributes: [],
                },
            }
        ],
        order : [
            ['created_at','DESC']
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

function listPendingByUser(req, res) {
    // default halaman saat ini adalah 1
    const currentPage = parseInt(req.query.page) || 1;

    // default hanya 5 data yang di tampilkan 
    const perPage = parseInt(req.query.perPage) || 5;

    // halaman saat ini - 1, halaman 1 - 1 = 0, lalu 0 * dengan berapapun hasilnya tetap 0. maka offset di mysql di mulai dari 0 di halaman pertama
    // jika halaman saat ini adalah ke 2, maka 2 -1 = 1, lalu 1 * 5(perPage) = 5, maka offseet mysql dimulai dari 6 karna 1-5 akan di skip dan loncat ke baris ke 6
    let dataOffset = (parseInt(currentPage)-1) * parseInt(perPage);

    Transaction.findAndCountAll({
        where : {
            user_id : req.user.id,
            status : "pending"
        },  
        attributes: { 
            exclude: ['cloudinary_id_evidence','updatedAt','UserId'] 
        },
        include : [
            {
                model : User,
                as : "user",
                attributes:['fullname']
            },
            {
                model : Book,
                as : "booktransactions",//harus sama dengan di database
                attributes : ['id','title'],
                through: {
                    attributes: [],
                },
            }
        ],
        order : [
            ['created_at','DESC']
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

function listCancelByUser(req, res) {
    // default halaman saat ini adalah 1
    const currentPage = parseInt(req.query.page) || 1;

    // default hanya 5 data yang di tampilkan 
    const perPage = parseInt(req.query.perPage) || 5;

    // halaman saat ini - 1, halaman 1 - 1 = 0, lalu 0 * dengan berapapun hasilnya tetap 0. maka offset di mysql di mulai dari 0 di halaman pertama
    // jika halaman saat ini adalah ke 2, maka 2 -1 = 1, lalu 1 * 5(perPage) = 5, maka offseet mysql dimulai dari 6 karna 1-5 akan di skip dan loncat ke baris ke 6
    let dataOffset = (parseInt(currentPage)-1) * parseInt(perPage);

    Transaction.findAndCountAll({
        where : {
            user_id : req.user.id,
            status : "cancel"
        },  
        attributes: { 
            exclude: ['cloudinary_id_evidence','updatedAt','UserId'] 
        },
        include : [
            {
                model : User,
                as : "user",
                attributes:['fullname']
            },
            {
                model : Book,
                as : "booktransactions",//harus sama dengan di database
                attributes : ['id','title'],
                through: {
                    attributes: [],
                },
            }
        ],
        order : [
            ['created_at','DESC']
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

module.exports = {list, listPendingByUser, listCancelByUser, create, changeStatus}