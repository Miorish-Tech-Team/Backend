const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");

const WarehouseAddress = sequelize.define(
  "WarehouseAddress",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    countryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    warehouseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pinCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {  
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressLine: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "warehouse_addresses",
    timestamps: true,
    indexes: [
      // Index on isPrimary for primary warehouse lookups
      {
        name: "idx_warehouses_primary",
        fields: ["isPrimary"],
      },
      // Index on countryName for country-based filtering
      {
        name: "idx_warehouses_country",
        fields: ["countryName"],
      },
      // Index on state for state-based filtering
      {
        name: "idx_warehouses_state",
        fields: ["state"],
      },
      // Index on city for city-based filtering
      {
        name: "idx_warehouses_city",
        fields: ["city"],
      },
      // Index on pinCode for pincode-based searches
      {
        name: "idx_warehouses_pincode",
        fields: ["pinCode"],
      },
      // Composite index for location queries
      {
        name: "idx_warehouses_location",
        fields: ["countryName", "state", "city"],
      },
      // Index on warehouseName for name searches
      {
        name: "idx_warehouses_name",
        fields: ["warehouseName"],
      },
    ],
  }
);

module.exports = WarehouseAddress;
