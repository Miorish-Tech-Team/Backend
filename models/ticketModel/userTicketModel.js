const { DataTypes } = require('sequelize');
const { sequelize } = require('../../mysqlConnection/dbConnection');
const User = require('../authModel/userModel');

const UserTicket = sequelize.define('UserTicket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
   ticketNumber: {
    type: DataTypes.STRING(8),
    unique: true,
    allowNull: false
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },

  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  image: {
    type: DataTypes.STRING, 
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM("open", "in_progress", "closed","resolved"),
    defaultValue: 'open'
  },

  adminReply: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Conversation thread: array of messages
  messages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
    // Structure: [{ sender: 'user'|'admin', message: 'text', timestamp: 'ISO date', isCrossQuestion: boolean }]
  }

}, {
  tableName: 'usertickets',
  timestamps: true,
  indexes: [
    // Index on ticketNumber for ticket lookups (already unique)
    {
      name: 'idx_user_tickets_number',
      fields: ['ticketNumber']
    },
    // Index on userId for user ticket queries
    {
      name: 'idx_user_tickets_user_id',
      fields: ['userId']
    },
    // Index on status for ticket status filtering
    {
      name: 'idx_user_tickets_status',
      fields: ['status']
    },
    // Index on createdAt for sorting by creation time
    {
      name: 'idx_user_tickets_created_at',
      fields: ['createdAt']
    },
    // Composite index for user and status queries
    {
      name: 'idx_user_tickets_user_status',
      fields: ['userId', 'status']
    },
    // Index on updatedAt for recent activity tracking
    {
      name: 'idx_user_tickets_updated_at',
      fields: ['updatedAt']
    }
  ]
});

module.exports = UserTicket;
