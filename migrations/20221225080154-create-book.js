'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Books', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        allowNull: false,
        type: Sequelize.STRING(150)
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING(150)
      },
      thumbnail: {
        type: Sequelize.STRING(150)
      },
      cloudinary_id_thumbnail: {
        type: Sequelize.STRING(50)
      },
      author: {
        allowNull: false,
        type: Sequelize.STRING(150)
      },
      price: {
        allowNull: false,
        type: Sequelize.INTEGER(6)
      },
      publication: {
        allowNull: false,
        type: Sequelize.DATE
      },
      pages: {
        type: Sequelize.STRING(4)
      },
      isbn: {
        type: Sequelize.STRING(17)
      },
      short_desc: {
        type: Sequelize.TEXT
      },
      detail: {
        type: Sequelize.TEXT
      },
      bookAttachment: {
        type: Sequelize.STRING(150)
      },
      cloudinary_id_bookAttachment: {
        type: Sequelize.STRING(50)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Books');
  }
};