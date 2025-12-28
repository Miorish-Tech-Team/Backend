const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../mysqlConnection/dbConnection');
const HomepageBanner = sequelize.define('HomepageBanner', {
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
  tableName: 'homepage_banners',
  timestamps: true,
  indexes: [
    // Index on createdAt for sorting by creation time
    {
      name: 'idx_homepage_banners_created_at',
      fields: ['createdAt']
    },
    // Index on updatedAt for recent updates
    {
      name: 'idx_homepage_banners_updated_at',
      fields: ['updatedAt']
    }
  ]
});

module.exports = HomepageBanner;
