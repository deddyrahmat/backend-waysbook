'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bestseller extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bestseller.belongsTo(models.Book, {
        as : "book", foreignKey : "book_id"
      })
    }
  }
  Bestseller.init({
    book_id: DataTypes.INTEGER,
    total: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Bestseller',
    underscored: true
  });
  return Bestseller;
};