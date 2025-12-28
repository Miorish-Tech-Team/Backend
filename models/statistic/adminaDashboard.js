const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");

const AdminStats = sequelize.define(
  "AdminStats",
  {
    totalRevenue: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalRevenuePercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalOrdersPercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    totalCustomers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalCustomersPercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    tableName: "admin_stats",
    timestamps: true,
    indexes: [
      // Index on createdAt for time-series analysis
      {
        name: 'idx_admin_stats_created_at',
        fields: ['createdAt']
      },
      // Index on updatedAt for recent stats
      {
        name: 'idx_admin_stats_updated_at',
        fields: ['updatedAt']
      },
      // Index on totalRevenue for revenue-based queries
      {
        name: 'idx_admin_stats_revenue',
        fields: ['totalRevenue']
      },
      // Index on totalOrders for order count queries
      {
        name: 'idx_admin_stats_orders',
        fields: ['totalOrders']
      }
    ]
  }
);

module.exports = AdminStats;
