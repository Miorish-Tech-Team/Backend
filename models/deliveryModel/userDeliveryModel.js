const { DataTypes } = require('sequelize');
const { sequelize } = require('../../mysqlConnection/dbConnection');
const DeliveryEstimate = sequelize.define("DeliveryEstimate", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  estimates: {
    type: DataTypes.JSON, 
    allowNull: false,
    defaultValue: {}, 
  },
}, {
  tableName: 'delivery_estimates',
  timestamps: true,
  indexes: [
    // Index on userId for user delivery estimate lookups (already unique)
    {
      name: 'idx_delivery_estimates_user_id',
      fields: ['userId']
    },
    // Index on createdAt for sorting
    {
      name: 'idx_delivery_estimates_created_at',
      fields: ['createdAt']
    },
    // Index on updatedAt for recent updates
    {
      name: 'idx_delivery_estimates_updated_at',
      fields: ['updatedAt']
    }
  ]
});

module.exports = DeliveryEstimate;
