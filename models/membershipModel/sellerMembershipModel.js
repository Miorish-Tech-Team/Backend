const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");

const Membership = sequelize.define("Membership", {
  planName: {
    type: DataTypes.ENUM("Basic", "Standard", "Premium"),
    allowNull: false,
  },
  durationInDays: {
    type: DataTypes.ENUM("30","90", "180", "365", "730"), 
    allowNull: false,
  },

  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "memberships",
  timestamps: true,
  indexes: [
    // Index on planName for plan type queries
    {
      name: 'idx_memberships_plan_name',
      fields: ['planName']
    },
    // Index on isActive for filtering active plans
    {
      name: 'idx_memberships_active',
      fields: ['isActive']
    },
    // Index on durationInDays for duration filtering
    {
      name: 'idx_memberships_duration',
      fields: ['durationInDays']
    },
    // Index on price for price-based sorting
    {
      name: 'idx_memberships_price',
      fields: ['price']
    },
    // Composite index for active plans by price
    {
      name: 'idx_memberships_active_price',
      fields: ['isActive', 'price']
    }
  ]
});

module.exports = Membership;
