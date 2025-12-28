const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");

const SearchHistory = sequelize.define(
  "SearchHistory",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
    },

    productIdList: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    searchTextList: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    tableName: "searchhistories",
    timestamps: true,
    indexes: [
      // Index on userId for user search history lookups (already unique)
      {
        name: 'idx_search_history_user_id',
        fields: ['userId']
      },
      // Index on createdAt for sorting
      {
        name: 'idx_search_history_created_at',
        fields: ['createdAt']
      },
      // Index on updatedAt for recent searches
      {
        name: 'idx_search_history_updated_at',
        fields: ['updatedAt']
      }
    ]
  }
);

module.exports = SearchHistory;
