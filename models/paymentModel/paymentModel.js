// Payment Model
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../mysqlConnection/dbConnection');
const  Order  = require('../orderModel/orderModel');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending', 
  },

  paymentReferenceId: {
    type: DataTypes.STRING,
    allowNull: true, 
  },

  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    // Index on orderId for order payment lookups
    {
      name: 'idx_payments_order_id',
      fields: ['orderId']
    },
    // Index on paymentStatus for status filtering
    {
      name: 'idx_payments_status',
      fields: ['paymentStatus']
    },
    // Index on paymentMethod for payment method analytics
    {
      name: 'idx_payments_method',
      fields: ['paymentMethod']
    },
    // Index on paymentReferenceId for reference tracking
    {
      name: 'idx_payments_reference',
      fields: ['paymentReferenceId']
    },
    // Index on paymentDate for date-based queries
    {
      name: 'idx_payments_date',
      fields: ['paymentDate']
    },
    // Index on createdAt for sorting
    {
      name: 'idx_payments_created_at',
      fields: ['createdAt']
    },
    // Composite index for status and method queries
    {
      name: 'idx_payments_status_method',
      fields: ['paymentStatus', 'paymentMethod']
    }
  ]
});

module.exports =  Payment ;
