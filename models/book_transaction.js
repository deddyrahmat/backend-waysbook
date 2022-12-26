'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book_transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // model pivot
      
    }
  }
  Book_transaction.init({
    book_id: DataTypes.INTEGER,
    transaction_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Book_transaction',
  });
  return Book_transaction;
};