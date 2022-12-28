'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // relation 1 - many (1 user punya banyak transaksi)
      Transaction.belongsTo(models.User, {
        as : "user", foreignKey : "user_id"
      })

      // relation many-many(tabel pivot book_transaction)
      Transaction.belongsToMany(models.Book, { through: 'Booktransaction',foreignKey: "transaction_id", });
    }
  }
  Transaction.init({
    user_id: DataTypes.INTEGER,
    evidence: DataTypes.STRING,
    cloudinary_id_evidence: DataTypes.STRING,
    total: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transaction',
    underscored: true
  });
  return Transaction;
};