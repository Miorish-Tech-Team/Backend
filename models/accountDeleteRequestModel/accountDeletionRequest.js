const { DataTypes } = require('sequelize');
const { sequelize } = require('../../mysqlConnection/dbConnection');
const User = require('../authModel/userModel');
const Seller = require('../authModel/sellerModel');

const AccountDeletionRequest = sequelize.define('AccountDeletionRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Seller,
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
 reason: {
  type: DataTypes.STRING,
  allowNull: true
},
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  uniqueAccountDeletedId: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true
  },
   deletedUserEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deletedUserName: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  deletedSellerEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deletedSellerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'account_deletion_requests',
  timestamps: true,
  indexes: [
    // Index on userId for user deletion requests
    {
      name: 'idx_deletion_requests_user_id',
      fields: ['userId']
    },
    // Index on sellerId for seller deletion requests
    {
      name: 'idx_deletion_requests_seller_id',
      fields: ['sellerId']
    },
    // Index on status for status filtering
    {
      name: 'idx_deletion_requests_status',
      fields: ['status']
    },
    // Index on uniqueAccountDeletedId for unique ID lookups (already unique)
    {
      name: 'idx_deletion_requests_unique_id',
      fields: ['uniqueAccountDeletedId']
    },
    // Index on createdAt for sorting by creation time
    {
      name: 'idx_deletion_requests_created_at',
      fields: ['createdAt']
    },
    // Index on deletedUserEmail for email lookups
    {
      name: 'idx_deletion_requests_user_email',
      fields: ['deletedUserEmail']
    },
    // Index on deletedSellerEmail for email lookups
    {
      name: 'idx_deletion_requests_seller_email',
      fields: ['deletedSellerEmail']
    }
  ]
});

module.exports = AccountDeletionRequest;
