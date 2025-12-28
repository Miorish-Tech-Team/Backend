const { DataTypes } = require('sequelize');
const { sequelize } = require('../../mysqlConnection/dbConnection');
const User  = require('../authModel/userModel');
const  Product  = require('../productModel/productModel');

const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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

  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  addedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

}, {
  tableName: 'wishlists',
  timestamps: true,
  indexes: [
    // Index on userId for user wishlist queries
    {
      name: 'idx_wishlists_user_id',
      fields: ['userId']
    },
    // Index on productId for product wishlist tracking
    {
      name: 'idx_wishlists_product_id',
      fields: ['productId']
    },
    // Index on addedAt for sorting by addition date
    {
      name: 'idx_wishlists_added_at',
      fields: ['addedAt']
    },
    // Composite unique index to prevent duplicate entries
    {
      name: 'idx_wishlists_user_product',
      unique: true,
      fields: ['userId', 'productId']
    }
  ]
});

module.exports =  Wishlist ;
