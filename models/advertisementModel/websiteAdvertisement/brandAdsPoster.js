const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../mysqlConnection/dbConnection');
const  BrandPoster = sequelize.define('BrandPoster', {
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
  tableName: 'brand_posters',
  timestamps: true,
  indexes: [
    // Index on createdAt for sorting by creation time
    {
      name: 'idx_brand_posters_created_at',
      fields: ['createdAt']
    },
    // Index on updatedAt for recent updates
    {
      name: 'idx_brand_posters_updated_at',
      fields: ['updatedAt']
    }
  ]
});

module.exports =  BrandPoster;
