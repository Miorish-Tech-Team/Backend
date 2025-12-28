const { DataTypes } = require("sequelize");
const {sequelize} = require("../../mysqlConnection/dbConnection"); 
const User = require("../authModel/userModel");
const Coupon = require("./couponModel");
const Product = require("../productModel/productModel");

const AppliedCoupon = sequelize.define("AppliedCoupon", {
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
        key: "id",
      },
    },
    couponId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Coupon,
        key: "id",
      },
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },

  discountAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'applied_coupons',
  timestamps: true,
  indexes: [
    // Index on userId for user applied coupons
    {
      name: 'idx_applied_coupons_user_id',
      fields: ['userId']
    },
    // Index on couponId for coupon usage tracking
    {
      name: 'idx_applied_coupons_coupon_id',
      fields: ['couponId']
    },
    // Index on productId for product coupon tracking
    {
      name: 'idx_applied_coupons_product_id',
      fields: ['productId']
    },
    // Composite index for user and coupon queries
    {
      name: 'idx_applied_coupons_user_coupon',
      fields: ['userId', 'couponId']
    },
    // Composite index for coupon and product queries
    {
      name: 'idx_applied_coupons_coupon_product',
      fields: ['couponId', 'productId']
    }
  ]
});

module.exports = AppliedCoupon;
