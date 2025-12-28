const { DataTypes } = require('sequelize');
const { sequelize }  = require('../../mysqlConnection/dbConnection');
const User   = require('../authModel/userModel');      
const Order  = require('../orderModel/orderModel'); 
const Seller = require('../authModel/sellerModel')


const SellerFeedback = sequelize.define('SellerFeedback', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Seller,          
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
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

  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },

  textComment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },


  sellerResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'seller_feedbacks',
  timestamps: true,
  indexes: [
    // Index on sellerId for seller feedback queries
    {
      name: 'idx_seller_feedbacks_seller_id',
      fields: ['sellerId']
    },
    // Index on userId for user feedback history
    {
      name: 'idx_seller_feedbacks_user_id',
      fields: ['userId']
    },
    // Index on orderId for order feedback lookups
    {
      name: 'idx_seller_feedbacks_order_id',
      fields: ['orderId']
    },
    // Index on rating for rating-based filtering
    {
      name: 'idx_seller_feedbacks_rating',
      fields: ['rating']
    },
    // Index on createdAt for date sorting
    {
      name: 'idx_seller_feedbacks_created_at',
      fields: ['createdAt']
    },
    // Composite index for seller and rating queries
    {
      name: 'idx_seller_feedbacks_seller_rating',
      fields: ['sellerId', 'rating']
    },
    // Composite unique index to prevent duplicate feedback per order
    {
      name: 'idx_seller_feedbacks_user_order',
      unique: true,
      fields: ['userId', 'orderId']
    }
  ]   
});

module.exports = SellerFeedback;
