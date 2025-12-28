const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../mysqlConnection/dbConnection');
const  WeeklyPromotion = sequelize.define('WeeklyPromotion', {
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
  tableName: 'weekly_promotions',
  timestamps: true,
  indexes: [
    // Index on createdAt for sorting by creation time
    {
      name: 'idx_weekly_promotions_created_at',
      fields: ['createdAt']
    },
    // Index on updatedAt for recent updates
    {
      name: 'idx_weekly_promotions_updated_at',
      fields: ['updatedAt']
    }
  ]
});

module.exports = WeeklyPromotion;
