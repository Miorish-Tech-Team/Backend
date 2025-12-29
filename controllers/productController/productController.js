const Product = require("../../models/productModel/productModel");
// const elasticClient = require("../../config/elasticSearchConfig/elasticSearchClient");
const Category = require("../../models/categoryModel/categoryModel");
const Seller = require("../../models/authModel/sellerModel");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");
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

    // Convert comma-separated strings to arrays for JSON fields
    const processArrayField = (field) => {
      if (!field) return null;
      if (typeof field === 'string') {
        const items = field.split(',').map(item => item.trim()).filter(Boolean);
        return items.length > 0 ? items : null;
      }
      if (Array.isArray(field)) {
        return field.length > 0 ? field : null;
      }
      return null;
    };

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
      productColors: processArrayField(productColors),
      productSizes: processArrayField(productSizes),
      productDiscountPercentage: productDiscountPercentage || null,
      productDiscountPrice: productDiscountPrice || null,
      saleDayleft: saleDayleft || null,
      availableStockQuantity: availableStockQuantity || 0,
      productWeight: productWeight || null,
      galleryImageUrls: galleryImageUrls || null,
      productVideoUrl: productVideoUrl || null,
      productWarrantyInfo: productWarrantyInfo || null,
      productReturnPolicy: productReturnPolicy || null,
      productTags: processArrayField(productTags),
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
  const transaction = await sequelize.transaction();
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const updateFields = {};
    const fields = [
      "productName", "productDescription", "productBrand", "productSubCategoryId",
      "productCategoryId", "stockKeepingUnit", "productModelNumber", "productBestSaleTag",
      "productDiscountPercentage", "productPrice", "productDiscountPrice", "saleDayleft",
      "availableStockQuantity", "productWeight", "productSizes", "productColors",
      "productDimensions", "productMaterial", "productWarrantyInfo", "productReturnPolicy",
      "productTags", "waxType", "singleOrCombo", "distributorPurchasePrice",
      "distributorSellingPrice", "retailerSellingPrice", "mrpB2B", "mrpB2C"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field] === "" ? null : req.body[field];
      }
    });

    // Convert comma-separated strings to arrays for JSON fields
    const jsonArrayFields = ["productTags", "productSizes", "productColors"];
    jsonArrayFields.forEach((field) => {
      if (updateFields[field]) {
        if (typeof updateFields[field] === 'string') {
          // Split comma-separated string into array
          const items = updateFields[field].split(',').map(item => item.trim()).filter(Boolean);
          updateFields[field] = items.length > 0 ? items : null;
        } else if (Array.isArray(updateFields[field])) {
          // Already an array, keep as is
          updateFields[field] = updateFields[field].length > 0 ? updateFields[field] : null;
        }
      }
    });

    // Handle cover image if uploaded
    if (req.files && req.files.coverImageUrl && req.files.coverImageUrl.length > 0) {
      updateFields.coverImageUrl = req.files.coverImageUrl[0].location;
    }

    // --- LOGIC FOR GALLERY IMAGE URLS ---
    let finalGalleryUrls = [];

    // 1. Handle existing images from the body (if any)
    if (req.body.existingGalleryUrls) {
      const existing = typeof req.body.existingGalleryUrls === 'string' 
        ? JSON.parse(req.body.existingGalleryUrls) 
        : req.body.existingGalleryUrls;
      finalGalleryUrls = Array.isArray(existing) ? existing.filter(u => u != null && u !== '') : [];
    } else {
      // Keep what's in the DB if nothing new is specified for 'existing'
      finalGalleryUrls = Array.isArray(product.galleryImageUrls) ? product.galleryImageUrls.filter(u => u != null && u !== '') : [];
    }

    // 2. Add newly uploaded gallery files - req.files.galleryImageUrls from fields() middleware
    if (req.files && req.files.galleryImageUrls && req.files.galleryImageUrls.length > 0) {
      const newUploads = req.files.galleryImageUrls
        .map(file => file.location)
        .filter(url => url != null && url !== ''); // Filter out undefined/null/empty
      finalGalleryUrls = [...finalGalleryUrls, ...newUploads];
    }

    // 3. Final cleanup: remove nulls/undefined and limit to 5
    const cleanUrls = finalGalleryUrls.filter(url => url != null && url !== '' && url !== undefined).slice(0, 5);
    updateFields.galleryImageUrls = cleanUrls.length > 0 ? cleanUrls : null;
    

    // --- CATEGORY COUNTER LOGIC (SAME AS BEFORE) ---
    if (req.body.productSubCategoryId && req.body.productSubCategoryId != product.productSubCategoryId) {
       // ... (your existing increment/decrement logic) ...
    }

    await product.update(updateFields, { transaction });
    await transaction.commit();

    // Refresh product to see the updated array clearly
    const updatedProduct = await Product.findByPk(productId);

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ success: false, error: error.message });
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
      minDiscount,
      maxDiscount,
      inStock,
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
        // Will sort in JavaScript after fetching to handle discount price
        orderClause = [["productPrice", "ASC"]];
        break;
      case "priceHighToLow":
        // Will sort in JavaScript after fetching to handle discount price
        orderClause = [["productPrice", "DESC"]];
        break;
      case "discountHighToLow":
        orderClause = [["productDiscountPercentage", "DESC"]];
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
        attributes: ["id", "categoryName"],
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

    // Apply price filtering after fetching (to handle discount price)
    let filteredProducts = products;
    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter((product) => {
        const effectivePrice = product.productDiscountPrice || product.productPrice;
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        return effectivePrice >= min && effectivePrice <= max;
      });
    }

    // Apply discount percentage filtering
    if (minDiscount || maxDiscount) {
      filteredProducts = filteredProducts.filter((product) => {
        const discount = product.productDiscountPercentage || 0;
        const min = minDiscount ? parseFloat(minDiscount) : 0;
        const max = maxDiscount ? parseFloat(maxDiscount) : 100;
        return discount >= min && discount <= max;
      });
    }

    // Apply stock quantity filtering
    if (inStock === "true") {
      filteredProducts = filteredProducts.filter(
        (product) => product.availableStockQuantity > 0
      );
    }

    // Apply price sorting after filtering (to handle discount price)
    if (sortBy === "priceLowToHigh" || sortBy === "priceHighToLow") {
      filteredProducts.sort((a, b) => {
        const priceA = a.productDiscountPrice || a.productPrice;
        const priceB = b.productDiscountPrice || b.productPrice;
        return sortBy === "priceLowToHigh" ? priceA - priceB : priceB - priceA;
      });
    }

    res.status(200).json({
      success: true,
      products: filteredProducts,
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
      message: "Missing or too short search query",
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
          attributes: ["id", "categoryName"],
          required: true,
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
      ],
      order: [["createdAt", "DESC"]],
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
          required: true,
        },
        {
          model: Seller,
          as: "seller",
          attributes: ["id", "sellerName", "email", "shopName"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
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
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
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
      limit: parseInt(process.env.recentproduct) || 10,
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
          required: false,
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
      limit: parseInt(process.env.productSearchSuggestions) || 20,
      order: [["productViewCount", "DESC"], ["totalSoldCount", "DESC"]],
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
    const currentProduct = await Product.findByPk(productId, {
      attributes: ['id', 'productTags', 'productCategoryId', 'productSubCategoryId']
    });
    if (!currentProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const { productTags, productCategoryId, productSubCategoryId } = currentProduct;

    // Parse productTags - could be JSON string or array
    let tagList = [];
    if (productTags) {
      try {
        const parsedTags = typeof productTags === 'string' 
          ? JSON.parse(productTags) 
          : productTags;
        tagList = Array.isArray(parsedTags)
          ? parsedTags.map(tag => tag.trim().toLowerCase())
          : [];
      } catch (e) {
        // If parsing fails, try splitting as comma-separated string
        tagList = productTags.split(",").map((tag) => tag.trim().toLowerCase());
      }
    }

    // Build the where clause
    const whereConditions = {
      id: { [Op.ne]: productId },
      status: "approved",
      [Op.or]: [
        { productCategoryId },
        { productSubCategoryId }
      ]
    };

    // Add tag matching if tags exist - use Sequelize.where for JSON casting
    if (tagList.length > 0) {
      const tagConditions = tagList.map((tag) => 
        sequelize.where(
          sequelize.cast(sequelize.col('productTags'), 'TEXT'),
          { [Op.iLike]: `%${tag}%` }
        )
      );
      whereConditions[Op.or].push(...tagConditions);
    }

    const similarProducts = await Product.findAll({
      where: whereConditions,
      limit: parseInt(process.env.similarProducts) || 4,
      order: [["averageCustomerRating", "DESC"], ["totalSoldCount", "DESC"]],
      attributes: [
        "id",
        "productName",
        "productPrice",
        "productDiscountPrice",
        "coverImageUrl",
        "productTags",
        "averageCustomerRating",
        "totalCustomerReviews",
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

// Seller-specific product controllers
const getMyProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};

    // If user is a seller, filter by sellerId
    if (userRole === "seller") {
      const seller = await Seller.findOne({ 
        where: { userId },
        attributes: ['id']
      });

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found",
        });
      }

      whereClause.sellerId = seller.id;
    } else if (userRole === "admin") {
      // If user is admin, filter by UserId (admin's user ID)
      whereClause.UserId = userId;
    }

    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    if (search) {
      whereClause.productName = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
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
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      products,
      totalProducts: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get My Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};

const getMyProductById = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { productId } = req.params;

    let whereClause = { id: productId };

    // If user is a seller, filter by sellerId
    if (userRole === "seller") {
      const seller = await Seller.findOne({ 
        where: { userId },
        attributes: ['id']
      });

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found",
        });
      }

      whereClause.sellerId = seller.id;
    } else if (userRole === "admin") {
      // If user is admin, filter by UserId (admin's user ID)
      whereClause.UserId = userId;
    }

    const product = await Product.findOne({
      where: whereClause,
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

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission to view it",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get My Product By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
      error: error.message,
    });
  }
};

const getMyProductsByStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    let whereClause = { status };

    // If user is a seller, filter by sellerId
    if (userRole === "seller") {
      const seller = await Seller.findOne({ 
        where: { userId },
        attributes: ['id']
      });

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found",
        });
      }

      whereClause.sellerId = seller.id;
    } else if (userRole === "admin") {
      // If user is admin, filter by UserId (admin's user ID)
      whereClause.UserId = userId;
    }

    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
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
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      products,
      totalProducts: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      status,
    });
  } catch (error) {
    console.error("Get My Products By Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products by status",
      error: error.message,
    });
  }
};

const getMyProductCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};

    // If user is a seller, filter by sellerId
    if (userRole === "seller") {
      const seller = await Seller.findOne({ where: { userId } });

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found",
        });
      }

      whereClause.sellerId = seller.id;
    } else if (userRole === "admin") {
      // If user is admin, filter by UserId (admin's user ID)
      whereClause.UserId = userId;
    }

    const totalCount = await Product.count({
      where: whereClause,
    });

    const approvedCount = await Product.count({
      where: { ...whereClause, status: "approved" },
    });

    const pendingCount = await Product.count({
      where: { ...whereClause, status: "pending" },
    });

    const rejectedCount = await Product.count({
      where: { ...whereClause, status: "rejected" },
    });

    res.status(200).json({
      success: true,
      count: {
        total: totalCount,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    console.error("Get My Product Count Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product count",
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
  getMyProducts,
  getMyProductById,
  getMyProductsByStatus,
  getMyProductCount,
};
