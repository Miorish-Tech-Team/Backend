const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");
const User = require("../authModel/userModel");
const Coupon = require("./couponModel");

const UserCoupon = sequelize.define(
  "UserCoupon",
  {
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
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    applied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_coupons",
    timestamps: false,
    indexes: [
      // Index on userId for user coupon queries
      {
        name: 'idx_user_coupons_user_id',
        fields: ['userId']
      },
      // Index on couponId for coupon distribution tracking
      {
        name: 'idx_user_coupons_coupon_id',
        fields: ['couponId']
      },
      // Index on used for filtering used coupons
      {
        name: 'idx_user_coupons_used',
        fields: ['used']
      },
      // Index on applied for filtering applied coupons
      {
        name: 'idx_user_coupons_applied',
        fields: ['applied']
      },
      // Index on assignedAt for sorting by assignment date
      {
        name: 'idx_user_coupons_assigned_at',
        fields: ['assignedAt']
      },
      // Composite unique index to prevent duplicate assignments
      {
        name: 'idx_user_coupons_user_coupon',
        unique: true,
        fields: ['userId', 'couponId']
      },
      // Composite index for user and usage status
      {
        name: 'idx_user_coupons_user_used',
        fields: ['userId', 'used']
      }
    ]
  }
);

module.exports = UserCoupon;
