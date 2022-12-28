// auth user
const schemaRegister = {
    fullname: { type: "string",min: 3, max: 100, optional:false },
    email: { type: "email",min: 3, max: 100, optional:false },
    password: { type: "string",min: 20, max: 255, optional:false },
};

// book
const schemaCreateBook = {
    title: {type : "string" ,min: 3, max: 150, optional:false},
    author: {type : "string", optional:false},
    price: {type: "string", min: 1, max: 6, optional:false},
    publication: {type : "string", optional:false},
    pages: {type : "string" ,min: 1, max: 4, optional:false},
    isbn: {type : "string"},
    short_desc: {type : "string" , optional:false},
    detail: {type : "string" , optional:false},
}


// transaction
const schemaTransactionPayment = {
    total: {type: "number", positive: true, integer: true, optional:false},
}

// status payment
const schemaStatusPayment = {
    status : {type : "string",min: 1, max: 8, optional : false}
}

module.exports = {schemaRegister,schemaCreateBook, schemaTransactionPayment, schemaStatusPayment}