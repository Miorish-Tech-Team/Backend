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
    indexes: [
      // Index on categoryId for category subcategory queries
      {
        name: 'idx_subcategories_category_id',
        fields: ['categoryId']
      },
      // Index on subCategoryName for name searches
      {
        name: 'idx_subcategories_name',
        fields: ['subCategoryName']
      },
      // Index on subCategoryProductCount for sorting
      {
        name: 'idx_subcategories_product_count',
        fields: ['subCategoryProductCount']
      },
      // Composite index for category and name queries
      {
        name: 'idx_subcategories_category_name',
        fields: ['categoryId', 'subCategoryName']
      },
      // Index on createdAt for sorting
      {
        name: 'idx_subcategories_created_at',
        fields: ['createdAt']
      }
    ]
  }
);


module.exports = SubCategory;
