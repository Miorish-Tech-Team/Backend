const { sequelize } = require("../mysqlConnection/dbConnection");
const { DataTypes } = require("sequelize");

/**
 * Migration to add shippingCost field to orders table
 * Run this migration to update existing database schema
 */
const addShippingCostToOrders = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();

    // Check if column already exists
    const tableDescription = await queryInterface.describeTable("orders");

    if (!tableDescription.shippingCost) {
      console.log("Adding shippingCost column to orders table...");

      await queryInterface.addColumn("orders", "shippingCost", {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: "Shipping cost for the order",
      });

      console.log("✓ Successfully added shippingCost column to orders table");
    } else {
      console.log("shippingCost column already exists in orders table");
    }
  } catch (error) {
    console.error("Error adding shippingCost column:", error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  addShippingCostToOrders()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = addShippingCostToOrders;
