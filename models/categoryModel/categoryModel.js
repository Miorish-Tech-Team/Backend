const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    categoryProductCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    categoryDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoryImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
    indexes: [
      // Index on categoryName for name lookups (already unique)
      {
        name: 'idx_categories_name',
        fields: ['categoryName']
      },
      // Index on categoryProductCount for sorting by product count
      {
        name: 'idx_categories_product_count',
        fields: ['categoryProductCount']
      },
      // Index on createdAt for sorting by creation time
      {
        name: 'idx_categories_created_at',
        fields: ['createdAt']
      }
    ]
  }
);

module.exports = Category;
