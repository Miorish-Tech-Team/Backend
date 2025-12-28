const { DataTypes } = require('sequelize');
const { sequelize } = require('../../mysqlConnection/dbConnection');
const User  = require('../authModel/userModel');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, 
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },

  status: {
    type: DataTypes.ENUM('active', 'ordered', 'cancelled'),
    defaultValue: 'active',
  }

}, {
  tableName: 'carts',
  timestamps: true,
  indexes: [
    // Index on userId for user cart lookups
    {
      name: 'idx_carts_user_id',
      fields: ['userId']
    },
    // Index on status for filtering active/ordered/cancelled carts
    {
      name: 'idx_carts_status',
      fields: ['status']
    },
    // Composite index for user and status queries
    {
      name: 'idx_carts_user_status',
      fields: ['userId', 'status']
    },
    // Index on createdAt for sorting by creation time
    {
      name: 'idx_carts_created_at',
      fields: ['createdAt']
    }
  ]
});

module.exports = Cart;