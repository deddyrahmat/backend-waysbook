'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Soldout extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Soldout.belongsTo(models.Book, {
        as : "book", foreignKey : "book_id"
      })
    }
  }
  Soldout.init({
    book_id: DataTypes.INTEGER,
    total: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Soldout',
    underscored: true
  });
  return Soldout;
};