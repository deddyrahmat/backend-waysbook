const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser')
const logger = require('morgan');
const cors = require('cors');

const userRouter = require('./routes/user');
const bookRouter = require('./routes/book');
const transactionRouter = require('./routes/transaction');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cors());

require('dotenv').config();

const port = process.env.PORT || 8000;


app.get('/', (req, res) => {
  res.send('Express Running');
})

app.use('/api/v1/user', userRouter);
app.use('/api/v1/book', bookRouter);
app.use('/api/v1/transaction', transactionRouter);


// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
//   });

//   // error handler
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
  
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
//   });

app.listen(port, () => {
    console.log('server started' )
})