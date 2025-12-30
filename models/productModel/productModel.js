const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");
const Category = require("../categoryModel/categoryModel");
const SubCategory = require("../categoryModel/subCategoryModel");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "sellers",
        key: "id",
      },
    },

    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },

    productTags: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    productCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    productDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    productBrand: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    productSubCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SubCategory,
        key: "id",
      },
    },

     productCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },

    stockKeepingUnit: {
      type: DataTypes.STRING,
    },

    productModelNumber: {
      type: DataTypes.STRING,
    },

    productBestSaleTag: {
      type: DataTypes.STRING,
    },

    // Pricing
    productDiscountPercentage: {
      type: DataTypes.FLOAT,
    },

    productPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    productDiscountPrice: {
      type: DataTypes.FLOAT,
    },
    distributorPurchasePrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    distributorSellingPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    retailerSellingPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    mrpB2B: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    // productMetadata: {
    //   type: DataTypes.JSON,
    //   allowNull: true,
    //   comment:
    //     "Stores specific specs like { waxType: 'Soy', burnTime: '40hrs' }",
    // },

    // --- SPECIFIC ATTRIBUTES (FROM IMAGE) ---
    waxType: {
      type: DataTypes.STRING, // e.g., Soy, Paraffin
      allowNull: true,
    },
    singleOrCombo: {
      type: DataTypes.ENUM("Single", "Combo"),
      defaultValue: "Single",
    },
    

    saleDayleft: {
      type: DataTypes.STRING,
    },

    saleStartDate: {
      type: DataTypes.DATE,
    },

    saleEndDate: {
      type: DataTypes.DATE,
    },

    // Inventory
    availableStockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    inventoryStatus: {
      type: DataTypes.ENUM("InStock", "onSale", "OutOfStock", "BackOrder"),
      defaultValue: "InStock",
    },

    productWeight: {
      type: DataTypes.FLOAT,
    },

    // Media
    coverImageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    productVideoUrl: {
      type: DataTypes.STRING,
    },

    galleryImageUrls: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // Ratings & Reviews
    averageCustomerRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    totalCustomerReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    customerReviews: {
      type: DataTypes.TEXT, // Stores a JSON string
      allowNull: true,
    },

    productWarrantyInfo: {
      type: DataTypes.STRING,
    },

    productReturnPolicy: {
      type: DataTypes.TEXT,
    },

    isNewArrivalProduct: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    //size , color and dimension
    productSizes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    productColors: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    productDimensions: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    productMaterial: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Analytics
    productViewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    totalSoldCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "products",
    timestamps: true,
    indexes: [
      // Index on sellerId for seller product queries
      {
        name: 'idx_products_seller_id',
        fields: ['sellerId']
      },
      // Index on UserId for user product queries
      {
        name: 'idx_products_user_id',
        fields: ['UserId']
      },
      // Index on productCategoryId for category filtering
      {
        name: 'idx_products_category_id',
        fields: ['productCategoryId']
      },
      // Index on productSubCategoryId for subcategory filtering
      {
        name: 'idx_products_sub_category_id',
        fields: ['productSubCategoryId']
      },
      // Index on status for filtering pending/approved/rejected products
      {
        name: 'idx_products_status',
        fields: ['status']
      },
      // Index on inventoryStatus for stock filtering
      {
        name: 'idx_products_inventory_status',
        fields: ['inventoryStatus']
      },
      // Index on productBrand for brand filtering
      {
        name: 'idx_products_brand',
        fields: ['productBrand']
      },
      // Index on productCode for quick product lookups
      {
        name: 'idx_products_product_code',
        fields: ['productCode']
      },
      // Index on isNewArrivalProduct for filtering new arrivals
      {
        name: 'idx_products_new_arrival',
        fields: ['isNewArrivalProduct']
      },
      // Index on productPrice for price-based sorting
      {
        name: 'idx_products_price',
        fields: ['productPrice']
      },
      // Index on averageCustomerRating for rating-based sorting
      {
        name: 'idx_products_rating',
        fields: ['averageCustomerRating']
      },
      // Index on totalSoldCount for best sellers
      {
        name: 'idx_products_sold_count',
        fields: ['totalSoldCount']
      },
      // Index on productViewCount for popular products
      {
        name: 'idx_products_view_count',
        fields: ['productViewCount']
      },
      // Index on createdAt for sorting by creation date
      {
        name: 'idx_products_created_at',
        fields: ['createdAt']
      },
      // Composite index for category and status queries
      {
        name: 'idx_products_category_status',
        fields: ['productCategoryId', 'status']
      },
      // Composite index for seller and status queries
      {
        name: 'idx_products_seller_status',
        fields: ['sellerId', 'status']
      },
      // Composite index for category, status, and price sorting
      {
        name: 'idx_products_category_status_price',
        fields: ['productCategoryId', 'status', 'productPrice']
      },
      // Composite index for inventory status and available stock
      {
        name: 'idx_products_inventory_stock',
        fields: ['inventoryStatus', 'availableStockQuantity']
      },
      // Composite index for sale products
      {
        name: 'idx_products_sale_dates',
        fields: ['saleStartDate', 'saleEndDate']
      }
    ]
  }
);

module.exports = Product;
