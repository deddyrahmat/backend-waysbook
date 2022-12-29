const {Transaction, Booktransaction, Bookuser, Soldout} = require('../models');
const Validator = require('fastest-validator');
const { schemaTransactionPayment, schemaStatusPayment } = require('../utilities/validation_schema');

const v = new Validator();

function create(req, res) {
    // console.log('req.files', req.body)
    const { books } = req.body;
    // const newBooks = JSON.parse(books);

    const data = {
        total : parseInt(req.body.total),
    }

    const check = v.validate( data, schemaTransactionPayment);
    if (check !== true) {
        res.status(403).json({
            status : 0,
            message : check
        })
    }else {
        Transaction.create({
            ...data,
            user_id : req.user.id,
            status : 'pending',
            cloudinary_id_evidence : req.files.evidence[0].filename,
            evidence : req.files.evidence[0].path,
        }).then((result) => {
            const dataBooks = books.map(book =>  {
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
            return res.status(403).json({
                status : 0,
                message : check
            })
        }

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

        if (req.body.status !== 'approve') {
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
            const resFindBook = await Soldout.findOne({where : {book_id : book}});
            console.log('resFindBook', resFindBook ? true : false);
            // cek buku sudah ada atau belum
            // kalo belum add data buku,kalo ada update total
            if (!resFindBook) {
                await Soldout.create({book_id : book, total : 1});
            }else{
                await Soldout.update({total : resFindBook.dataValues.total + 1},{where : {
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

module.exports = {create, changeStatus}