const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../mysqlConnection/dbConnection');
const  ProductPosterAds = sequelize.define('ProductPosterAds', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },

}, {
  tableName: 'product_posters_ads',
  timestamps: true,
  indexes: [
    // Index on createdAt for sorting by creation time
    {
      name: 'idx_product_posters_created_at',
      fields: ['createdAt']
    },
    // Index on updatedAt for recent updates
    {
      name: 'idx_product_posters_updated_at',
      fields: ['updatedAt']
    }
  ]
});

module.exports =   ProductPosterAds;
