const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");
const User = require("../authModel/userModel");

const Address = sequelize.define(
  "Address",
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
      onDelete: "CASCADE", // Ensure the address is deleted if the user is deleted
    },

    recipientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "addresses",
    timestamps: true,
    indexes: [
      // Index on userId for user address lookups
      {
        name: "idx_addresses_user_id",
        fields: ["userId"],
      },
      // Index on isDefault for default address queries
      {
        name: "idx_addresses_default",
        fields: ["isDefault"],
      },
      // Index on type for address type filtering
      {
        name: "idx_addresses_type",
        fields: ["type"],
      },
      // Composite index for user and default address
      {
        name: "idx_addresses_user_default",
        fields: ["userId", "isDefault"],
      },
      // Composite index for location queries
      {
        name: "idx_addresses_location",
        fields: ["country", "state", "city"],
      },
      // Index on postalCode for zip-based searches
      {
        name: "idx_addresses_postal",
        fields: ["postalCode"],
      },
    ],
  }
);

module.exports = Address;
