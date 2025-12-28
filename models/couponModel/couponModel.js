const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");

const Coupon = sequelize.define("Coupon", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  discountPercentage: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  discountAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  validTill: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maxUsageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  autoAssignOnSignup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "coupons",
  timestamps: true,
  indexes: [
    // Index on code for coupon code lookups (already unique)
    {
      name: 'idx_coupons_code',
      fields: ['code']
    },
    // Index on isActive for filtering active coupons
    {
      name: 'idx_coupons_active',
      fields: ['isActive']
    },
    // Index on autoAssignOnSignup for signup coupons
    {
      name: 'idx_coupons_auto_assign',
      fields: ['autoAssignOnSignup']
    },
    // Index on validFrom for validity queries
    {
      name: 'idx_coupons_valid_from',
      fields: ['validFrom']
    },
    // Index on validTill for expiry tracking
    {
      name: 'idx_coupons_valid_till',
      fields: ['validTill']
    },
    // Composite index for active and valid coupons
    {
      name: 'idx_coupons_active_validity',
      fields: ['isActive', 'validFrom', 'validTill']
    },
    // Index on usageCount for usage analytics
    {
      name: 'idx_coupons_usage',
      fields: ['usageCount']
    }
  ]
});

module.exports = Coupon;