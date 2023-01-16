"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // relation 1 - many (1 user punya banyak transaksi)
            User.hasMany(models.Transaction, { as: "transactions" });

            // relation many-many(menghasilkan tabel pivot book_user)
            User.belongsToMany(models.Book, {
                through: {
                  model : "Bookusers"
                },
                // as: "bookusers",
                foreignKey: "user_id",
            });
        }
    }
    User.init(
        {
            avatar: DataTypes.STRING,
            fullname: DataTypes.STRING,
            password: DataTypes.STRING,
            email: DataTypes.STRING,
            gender: DataTypes.STRING,
            phone: DataTypes.STRING,
            location: DataTypes.TEXT,
            role: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "User",
            underscored: true,
        }
    );
    return User;
};
