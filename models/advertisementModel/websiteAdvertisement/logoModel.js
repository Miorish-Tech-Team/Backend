const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../mysqlConnection/dbConnection');
const Logo = sequelize.define('Logo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },

}, {
  tableName: 'logos',
  timestamps: true,
  indexes: [
    // Index on createdAt for sorting by creation time
    {
      name: 'idx_logos_created_at',
      fields: ['createdAt']
    },
    // Index on updatedAt for recent updates
    {
      name: 'idx_logos_updated_at',
      fields: ['updatedAt']
    }
  ]
});

module.exports = Logo;
