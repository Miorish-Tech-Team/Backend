// Review Model
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");
const User = require("../authModel/userModel");
const Product = require("../productModel/productModel");

const Review = sequelize.define(
  "Review",
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
      onDelete: "CASCADE",
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      onDelete: "CASCADE",
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },

    reviewText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewPhoto: {
      type: DataTypes.STRING,
      allowNull: true, // Optional
    },
    reviewLike: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    reviewDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    indexes: [
      // Index on userId for user reviews
      {
        name: 'idx_reviews_user_id',
        fields: ['userId']
      },
      // Index on productId for product reviews
      {
        name: 'idx_reviews_product_id',
        fields: ['productId']
      },
      // Index on rating for rating-based filtering
      {
        name: 'idx_reviews_rating',
        fields: ['rating']
      },
      // Index on reviewDate for date-based sorting
      {
        name: 'idx_reviews_date',
        fields: ['reviewDate']
      },
      // Index on reviewLike for most liked reviews
      {
        name: 'idx_reviews_like_count',
        fields: ['reviewLike']
      },
      // Index on createdAt for sorting by creation time
      {
        name: 'idx_reviews_created_at',
        fields: ['createdAt']
      },
      // Composite index for product and rating queries
      {
        name: 'idx_reviews_product_rating',
        fields: ['productId', 'rating']
      },
      // Composite index for product and date queries
      {
        name: 'idx_reviews_product_date',
        fields: ['productId', 'reviewDate']
      },
      // Composite index for user and product (prevent duplicate reviews)
      {
        name: 'idx_reviews_user_product',
        fields: ['userId', 'productId']
      }
    ]
  }
);

module.exports = Review;
