const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");
const User = require("../authModel/userModel");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
      coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("order", "account","support","global", "custom","coupon"),
      defaultValue: "custom",
    },
   userId: {
    type: DataTypes.INTEGER,
    allowNull: true, 
    references: {
      model: User,
      key: 'id',
    },
  },
  
  },
  {
    tableName: "notifications",
    timestamps: true,
    indexes: [
      // Index on userId for user notification queries
      {
        name: 'idx_notifications_user_id',
        fields: ['userId']
      },
      // Index on type for notification type filtering
      {
        name: 'idx_notifications_type',
        fields: ['type']
      },
      // Index on createdAt for sorting by creation time
      {
        name: 'idx_notifications_created_at',
        fields: ['createdAt']
      },
      // Composite index for user and type queries
      {
        name: 'idx_notifications_user_type',
        fields: ['userId', 'type']
      },
      // Composite index for user and date queries
      {
        name: 'idx_notifications_user_date',
        fields: ['userId', 'createdAt']
      }
    ]
  }
);

module.exports = Notification;
