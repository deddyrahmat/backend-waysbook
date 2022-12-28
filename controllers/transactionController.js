const {Transaction, Booktransaction} = require('../models');
const Validator = require('fastest-validator');
const { schemaTransactionPayment } = require('../utilities/validation_schema');

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

module.exports = {create}