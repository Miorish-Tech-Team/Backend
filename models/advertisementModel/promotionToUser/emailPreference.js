const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../mysqlConnection/dbConnection');
const User = require('../../authModel/userModel');

const EmailPreference = sequelize.define('EmailPreference', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  promotions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  productLaunches: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'email_preferences',
  timestamps: true,
  indexes: [
    // Index on userId for user preference lookups (already unique)
    {
      name: 'idx_email_preferences_user_id',
      fields: ['userId']
    },
    // Index on promotions for filtering users who accept promotions
    {
      name: 'idx_email_preferences_promotions',
      fields: ['promotions']
    },
    // Index on productLaunches for filtering users who want product launch emails
    {
      name: 'idx_email_preferences_launches',
      fields: ['productLaunches']
    },
    // Composite index for users who want any email type
    {
      name: 'idx_email_preferences_any_enabled',
      fields: ['promotions', 'productLaunches']
    }
  ]
});

module.exports = EmailPreference;
