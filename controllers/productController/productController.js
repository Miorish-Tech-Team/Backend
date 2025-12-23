const Product = require("../../models/productModel/productModel");
// const elasticClient = require("../../config/elasticSearchConfig/elasticSearchClient");
const Category = require("../../models/categoryModel/categoryModel");
const Seller = require("../../models/authModel/sellerModel");
const { Op } = require("sequelize");
const Review = require("../../models/reviewModel/reviewModel");
const User = require("../../models/authModel/userModel");
const ReviewLike = require("../../models/reviewLikeModel/reviewLikeModel");
const SubCategory = require("../../models/categoryModel/subCategoryModel");

const handleAddProduct = async (req, res) => {
  try {
    let sellerId = null;

    if (req.user.role === "seller") {
      const seller = await Seller.findOne({ where: { userId: req.user.id } });
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found for the logged-in user.",
        });
      }
      sellerId = seller.id;
    }

    const {
      productName,
      productDescription,
      productBrand,
      productSubCategoryId,
      productPrice,
      productCode,
      stockKeepingUnit,
      productModelNumber,
      productBestSaleTag,
      productDiscountPercentage,
      productDiscountPrice,
      saleDayleft,
      availableStockQuantity,
      productWeight,
      galleryImageUrls,
      productVideoUrl,
      productSizes,
      productColors,
      productDimensions,
      productMaterial,
      productWarrantyInfo,
      productReturnPolicy,
      productTags,
      waxType,
      singleOrCombo,
      distributorPurchasePrice,
      distributorSellingPrice,
      retailerSellingPrice,
      mrpB2B,
    } = req.body;

    if (!req.fileUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Cover image is mandatory." });
    }

    if (
      !productName ||
      !productDescription ||
      !productBrand ||
      !productSubCategoryId ||
      !productPrice ||
      !productCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: Name, Description, Brand, SubCategory, Price, or Code.",
      });
    }

    const subCategory = await SubCategory.findByPk(productSubCategoryId, {
      include: [{ model: Category, as: 'category' }],
    });

    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "SubCategory not found." });
    }

    const derivedCategoryId = subCategory.categoryId;

    const category = await Category.findByPk(derivedCategoryId);
    if (category) {
      await category.increment("categoryProductCount");
    }

    if (subCategory) {
      await subCategory.increment("subCategoryProductCount");
    }

    const product = await Product.create({
      productName,
      productDescription,
      productBrand,
      productSubCategoryId,
      productCategoryId: derivedCategoryId,
      productCode,
      productPrice,
      coverImageUrl: req.fileUrl,
      stockKeepingUnit: stockKeepingUnit || null,
      productModelNumber: productModelNumber || null,
      productBestSaleTag: productBestSaleTag || null,
      productMaterial: productMaterial || null,
      productDimensions: productDimensions || null,
      productColors: productColors || null,
      productSizes: productSizes || null,
      productDiscountPercentage: productDiscountPercentage || null,
      productDiscountPrice: productDiscountPrice || null,
      saleDayleft: saleDayleft || null,
      availableStockQuantity: availableStockQuantity || 0,
      productWeight: productWeight || null,
      galleryImageUrls: galleryImageUrls || null,
      productVideoUrl: productVideoUrl || null,
      productWarrantyInfo: productWarrantyInfo || null,
      productReturnPolicy: productReturnPolicy || null,
      productTags: productTags || null,
      waxType: waxType || null,
      singleOrCombo: singleOrCombo || "Single",
      distributorPurchasePrice: distributorPurchasePrice || null,
      distributorSellingPrice: distributorSellingPrice || null,
      retailerSellingPrice: retailerSellingPrice || null,
      mrpB2B: mrpB2B || null,

      status: req.user.role === "admin" ? "approved" : "pending",
      sellerId,
      UserId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully and category count updated.",
      product,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding product.",
      error: error.message,
    });
  }
};
const handleUpdateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const updateFields = {};

    const fields = [
      "productName",
      "productDescription",
      "productBrand",
      "productSubCategoryId",
      "productCategoryId", 
      "stockKeepingUnit",
      "productModelNumber",
      "productBestSaleTag",
      "productDiscountPercentage",
      "productPrice",
      "productDiscountPrice",
      "saleDayleft",
      "availableStockQuantity",
      "productWeight",
      "productSizes",
      "productColors",
      "productDimensions",
      "productMaterial",
      "productWarrantyInfo",
      "productReturnPolicy",
      "productTags",
      "waxType",
      "singleOrCombo",
      "distributorPurchasePrice",
      "distributorSellingPrice",
      "retailerSellingPrice",
      "mrpB2B",
      "mrpB2C"
    ];

    const numericFields = [
      "productPrice",
      "productDiscountPercentage",
      "productDiscountPrice",
      "availableStockQuantity",
      "productWeight",
      "distributorPurchasePrice",
      "distributorSellingPrice",
      "retailerSellingPrice",
      "mrpB2B",
      "mrpB2C"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];

        if (numericFields.includes(field) && value === "") {
          value = field === "availableStockQuantity" ? 0 : null;
        }

        updateFields[field] = value;
      }
    });

    if (req.fileUrl) {
      updateFields.coverImageUrl = req.fileUrl;
    }

    // Handle gallery images: merge existing URLs with new uploads
    if (req.body.existingGalleryUrls || (req.fileUrls && req.fileUrls.length > 0)) {
      const existingUrls = req.body.existingGalleryUrls 
        ? JSON.parse(req.body.existingGalleryUrls) 
        : [];
      const newUrls = req.fileUrls || [];
      
      // Combine existing and new, limit to 5 total
      const combinedUrls = [...existingUrls, ...newUrls].slice(0, 5);
      updateFields.galleryImageUrls = combinedUrls.length > 0 ? combinedUrls : null;
    }

    // Handle category/subcategory changes and update counts
    if (req.body.productSubCategoryId && req.body.productSubCategoryId !== product.productSubCategoryId) {
      const newSubCategory = await SubCategory.findByPk(req.body.productSubCategoryId);
      if (newSubCategory) {
        // Decrement old subcategory count
        const oldSubCategory = await SubCategory.findByPk(product.productSubCategoryId);
        if (oldSubCategory) {
          await oldSubCategory.decrement("subCategoryProductCount");
        }

        // Increment new subcategory count
        await newSubCategory.increment("subCategoryProductCount");

        // Check if category also changed
        if (newSubCategory.categoryId !== product.productCategoryId) {
          // Decrement old category count
          const oldCategory = await Category.findByPk(product.productCategoryId);
          if (oldCategory) {
            await oldCategory.decrement("categoryProductCount");
          }

          // Increment new category count
          const newCategory = await Category.findByPk(newSubCategory.categoryId);
          if (newCategory) {
            await newCategory.increment("categoryProductCount");
          }

          updateFields.productCategoryId = newSubCategory.categoryId;
        }
      }
    }

    await product.update(updateFields);

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating product.",
      error: error.message,
    });
  }
};

const handleDeleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Decrement counts before deleting
    const category = await Category.findByPk(product.productCategoryId);
    if (category) {
      await category.decrement("categoryProductCount");
    }

    const subCategory = await SubCategory.findByPk(product.productSubCategoryId);
    if (subCategory) {
      await subCategory.decrement("subCategoryProductCount");
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product.",
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      categories,
      brands,
      minPrice,
      maxPrice,
      inventoryStatus,
      colors,
      sortBy,
    } = req.query;

    const categoryFilter = categories
      ? categories.split(",").map((c) => c.trim())
      : null;
    const brandFilter = brands ? brands.split(",").map((b) => b.trim()) : null;
    const inventoryFilter = inventoryStatus
      ? inventoryStatus.split(",").map((s) => s.trim())
      : null;
    const colorFilter = colors ? colors.split(",").map((c) => c.trim()) : null;

    let orderClause = [["createdAt", "DESC"]];
    switch (sortBy) {
      case "popular":
        orderClause = [["totalSoldCount", "DESC"]];
        break;
      case "rating":
        orderClause = [["averageCustomerRating", "DESC"]];
        break;
      case "priceLowToHigh":
        orderClause = [["productPrice", "ASC"]];
        break;
      case "priceHighToLow":
        orderClause = [["productPrice", "DESC"]];
        break;
      case "latest":
        orderClause = [["createdAt", "DESC"]];
        break;
    }

    const whereClause = {
      status: "approved",
      ...(brandFilter && {
        productBrand: { [Op.in]: brandFilter },
      }),
      ...((minPrice || maxPrice) && {
        productPrice: {
          ...(minPrice && { [Op.gte]: parseFloat(minPrice) }),
          ...(maxPrice && { [Op.lte]: parseFloat(maxPrice) }),
        },
      }),

      ...(inventoryFilter && {
        inventoryStatus: { [Op.in]: inventoryFilter },
      }),
      ...(colorFilter && {
        productColors: {
          [Op.or]: colorFilter.map((color) => ({
            [Op.iLike]: `%${color}%`,
          })),
        },
      }),
    };

    const includeClause = [
      {
        model: Category,
        as: "category",
        attributes: ["categoryName"],
        ...(categoryFilter && {
          where: {
            categoryName: { [Op.in]: categoryFilter },
          },
          required: true,
        }),
      },
      {
        model: SubCategory,
        as: "subcategory",
        attributes: ["id", "subCategoryName"],
      },
      {
        model: Seller,
        as: "seller",
        attributes: ["id", "sellerName", "email", "shopName"],
        required: false,
      },
    ];

    const products = await Product.findAll({
      where: whereClause,
      include: includeClause,
      order: orderClause,
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryName"],
        },
        {
          model: SubCategory,
          as: "subcategory",
          attributes: ["id", "subCategoryName"],
        },
        {
          model: Seller,
          as: "seller",
          attributes: ["id", "sellerName", "email", "shopName"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product by ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product by ID",
      error: error.message,
    });
  }
};

const searchProducts = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim().length < 1) {
    return res.status(400).json({
      success: false,
      message: "Missing or too s  hort search query",
    });
  }

  try {
    const searchTerm = query.trim();
    const searchPattern = `%${searchTerm}%`;

    const products = await Product.findAll({
      where: {
        status: "approved",
        [Op.or]: [
          { productName: { [Op.iLike]: searchPattern } },
          { productBrand: { [Op.iLike]: searchPattern } },
          { productDescription: { [Op.iLike]: searchPattern } },
          { productCode: { [Op.iLike]: searchPattern } },
          { productMaterial: { [Op.iLike]: searchPattern } },
          { waxType: { [Op.iLike]: searchPattern } },
        ],
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryName"],
        },
        {
          model: SubCategory,
          as: "subcategory",
          attributes: ["id", "subCategoryName"],
        },
        {
          model: Seller,
          as: "seller",
          attributes: ["id", "sellerName", "email", "shopName"],
        },
      ],
      order: [
        ["averageCustomerRating", "DESC"],
        ["totalSoldCount", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit: 50,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Search Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching products",
      error: error.message,
    });
  }
};

const getProductsByCategory = async (req, res) => {
  const { categoryName } = req.params;
  try {
    const products = await Product.findAll({
      where: { status: "approved" },
      include: [
        {
          model: Category,
          as: "category",
          where: { categoryName },
          attributes: ["categoryName"],
        },
        {
          model: SubCategory,
          as: "subcategory",
          attributes: ["id", "subCategoryName"],
        },
        {
          model: Seller,
          as: "seller",
          attributes: ["id", "sellerName", "email", "shopName"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get Products by Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products by category",
      error: error.message,
    });
  }
};

const getProductsBySubCategory = async (req, res) => {
  const { subCategoryName } = req.params;
  try {
    const products = await Product.findAll({
      where: { status: "approved" },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryName"],
        },
        {
          model: SubCategory,
          as: "subcategory",
          where: { subCategoryName },
          attributes: ["id", "subCategoryName"],
        },
        {
          model: Seller,
          as: "seller",
          attributes: ["id", "sellerName", "email", "shopName"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get Products by SubCategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products by subcategory",
      error: error.message,
    });
  }
};

const getProductsByBrand = async (req, res) => {
  const { brandName } = req.params;

  try {
    const products = await Product.findAll({
      where: {
        status: "approved",
        productBrand: { [Op.iLike]: `%${brandName}%` },
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["categoryName"],
        },
        {
          model: SubCategory,
          as: "subcategory",
          attributes: ["id", "subCategoryName"],
        },
        {
          model: Seller,
          as: "seller",
          attributes: ["id", "sellerName", "email", "shopName"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get Products by Brand Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products by brand",
      error: error.message,
    });
  }
};

const getProductsByCategoryMultiple = async (req, res) => {
  const { categories } = req.query;
  const { categoryName } = req.params;

  // 1. Normalize the input
  let categoryArray = [];
  if (categories) {
    categoryArray = categories.split(",").map((c) => c.trim());
  } else if (categoryName) {
    categoryArray = [categoryName];
  }

  try {
    const products = await Product.findAll({
      // 2. CRITICAL: Move the filter logic into the 'where' if possible
      // or ensure the include has 'required: true'
      where: { 
        status: "approved" 
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["categoryName"],
          // 3. REQUIRED: true forces an INNER JOIN (removes non-matching products)
          required: categoryArray.length > 0, 
          where: categoryArray.length > 0 ? {
            categoryName: {
              // iLike is essential for PostgreSQL case-insensitivity
              [Op.iLike]: { [Op.any]: categoryArray.map(c => `%${c}%`) } 
            }
          } : undefined
        },
        {
          model: SubCategory,
          as: "subcategory",
          attributes: ["id", "subCategoryName"],
        },
        {
          model: Seller,
          as: "seller",
          attributes: ["id", "sellerName", "email", "shopName"],
        },
      ],
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for these categories",
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products by Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getRecentProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: "approved" },
      order: [["createdAt", "DESC"]],
      limit: process.env.recentproduct,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["categoryName"],
        },
        {
          model: SubCategory,
          as: "subcategory",
          attributes: ["id", "subCategoryName"],
        },
        {
          model: Seller,
          as: "seller",
          attributes: ["id", "sellerName", "email", "shopName"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get Recent Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recent products",
      error: error.message,
    });
  }
};
const handleGetQuerySuggestions = async (req, res) => {
  const query = req.query.q;

  if (!query || query.length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  try {
    const searchTerm = query.trim();
    const searchPattern = `%${searchTerm}%`;

    const products = await Product.findAll({
      where: {
        status: "approved",
        [Op.or]: [
          { productName: { [Op.iLike]: searchPattern } },
          { productBrand: { [Op.iLike]: searchPattern } },
          { productMaterial: { [Op.iLike]: searchPattern } },
          { waxType: { [Op.iLike]: searchPattern } },
        ],
      },
      attributes: ["productName", "productBrand", "productTags", "waxType", "productMaterial"],
      limit: process.env.productSearchSuggestions,
    });

    const suggestionsSet = new Set();
    const lowerSearch = searchTerm.toLowerCase();

    products.forEach((product) => {
      if (product.productName && product.productName.toLowerCase().includes(lowerSearch)) {
        suggestionsSet.add(product.productName);
      }
      if (product.productBrand && product.productBrand.toLowerCase().includes(lowerSearch)) {
        suggestionsSet.add(product.productBrand);
      }
    });

    const suggestions = Array.from(suggestionsSet).slice(0, 8);
    res.status(200).json({ success: true, suggestions });
    
  } catch (err) {
    console.error("Query suggestion error:", err);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

const getSimilarProducts = async (req, res) => {
  const { productId } = req.params;

  try {
    const currentProduct = await Product.findByPk(productId);
    if (!currentProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const { productTags, productCategoryId, productSubCategoryId } = currentProduct;

    const tagList = productTags
      ? productTags.split(",").map((tag) => tag.trim().toLowerCase())
      : [];

    const similarProducts = await Product.findAll({
      where: {
        id: { [Op.ne]: productId }, 
        status: "approved",
        [Op.or]: [
          { productCategoryId },
          { productSubCategoryId },
          ...(tagList.length > 0
            ? [
                {
                  productTags: {
                    [Op.or]: tagList.map((tag) => ({
                      [Op.iLike]: `%${tag}%`,
                    })),
                  },
                },
              ]
            : []),
        ],
      },
      limit: process.env.similarProducts, 
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "productName",
        "productPrice",
        "coverImageUrl",
        "productTags",
        "averageCustomerRating",
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryName"],
        },
        {
          model: SubCategory,
          as: "subcategory",
          attributes: ["id", "subCategoryName"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: similarProducts.length,
      similarProducts,
    });
  } catch (error) {
    console.error("Get Similar Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching similar products",
      error: error.message,
    });
  }
};

const handleBulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of product IDs to delete.",
      });
    }

    // Find all products to be deleted
    const products = await Product.findAll({
      where: {
        id: productIds,
      },
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found with the provided IDs.",
      });
    }

    // Track category and subcategory counts to decrement
    const categoryUpdates = {};
    const subCategoryUpdates = {};

    products.forEach((product) => {
      if (product.productCategoryId) {
        categoryUpdates[product.productCategoryId] = 
          (categoryUpdates[product.productCategoryId] || 0) + 1;
      }
      if (product.productSubCategoryId) {
        subCategoryUpdates[product.productSubCategoryId] = 
          (subCategoryUpdates[product.productSubCategoryId] || 0) + 1;
      }
    });

    // Decrement category counts
    for (const [categoryId, count] of Object.entries(categoryUpdates)) {
      const category = await Category.findByPk(categoryId);
      if (category) {
        await category.decrement("categoryProductCount", { by: count });
      }
    }

    // Decrement subcategory counts
    for (const [subCategoryId, count] of Object.entries(subCategoryUpdates)) {
      const subCategory = await SubCategory.findByPk(subCategoryId);
      if (subCategory) {
        await subCategory.decrement("subCategoryProductCount", { by: count });
      }
    }

    // Delete all products
    await Product.destroy({
      where: {
        id: productIds,
      },
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${products.length} product(s).`,
      deletedCount: products.length,
    });
  } catch (error) {
    console.error("Bulk Delete Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting products.",
      error: error.message,
    });
  }
};

module.exports = {
  handleAddProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleBulkDeleteProducts,
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getProductsBySubCategory,
  getProductsByBrand,
  getRecentProducts,
  getProductsByCategoryMultiple,
  handleGetQuerySuggestions,
  getSimilarProducts,
};
