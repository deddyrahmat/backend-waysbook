'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // relation 1-1
      Book.hasOne(models.Sold_out);

      // relation many-many
      Book.belongsToMany(models.Transaction, { through: 'Book_transaction' });

      // relation many-many
      Book.belongsToMany(models.User, { through: 'Book_user' });
    }
  }
  Book.init({
    slug: DataTypes.STRING,
    title: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    author: DataTypes.STRING,
    price: DataTypes.INTEGER,
    publication: DataTypes.DATE,
    pages: DataTypes.STRING,
    isbn: DataTypes.STRING,
    short_desc: DataTypes.TEXT,
    detail: DataTypes.TEXT,
    bookAttachment: DataTypes.STRING,
    cloudinary_id_bookAttachment: DataTypes.STRING,
    cloudinary_id_thumbnail: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};