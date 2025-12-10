const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");
const Category = require("./categoryModel");

const SubCategory = sequelize.define(
  "SubCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subCategoryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    subCategoryProductCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    subCategoryDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subCategoryImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "subcategories",
    timestamps: true,
  }
);


module.exports = SubCategory;
