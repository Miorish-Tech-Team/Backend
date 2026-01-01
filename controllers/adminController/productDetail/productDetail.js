const Product = require("../../../models/productModel/productModel");
const Category = require("../../../models/categoryModel/categoryModel");
const SubCategory = require("../../../models/categoryModel/subCategoryModel");

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["categoryName"],
        },
        {
          model: SubCategory,
          as: "subcategory",
          attributes: ["subCategoryName"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      products,
      totalProducts: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category", attributes: ["categoryName"] },
        { model: SubCategory, as: "subcategory", attributes: ["subCategoryName"] },
      ],
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductCount = async (req, res) => {
  try {
    const count = await Product.count();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductStats = async (req, res) => {
  try {
    const [stats] = await Product.findAll({
      attributes: [
        [
          Product.sequelize.fn(
            "COALESCE",
            Product.sequelize.fn(
              "SUM",
              Product.sequelize.col("availableStockQuantity")
            ),
            0
          ),
          "totalStock",
        ],
        [
          Product.sequelize.fn(
            "COALESCE",
            Product.sequelize.fn(
              "SUM",
              Product.sequelize.col("productViewCount")
            ),
            0
          ),
          "totalViews",
        ],
        [
          Product.sequelize.fn(
            "COALESCE",
            Product.sequelize.fn(
              "SUM",
              Product.sequelize.col("totalSoldCount")
            ),
            0
          ),
          "totalSold",
        ],
      ],
      raw: true,
    });

    res.status(200).json({
      totalStock: parseInt(stats.totalStock),
      totalViews: parseInt(stats.totalViews),
      totalSold: parseInt(stats.totalSold),
    });
  } catch (err) {
    console.error("Error in getProductStats:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching product stats." });
  }
};

const getProductsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: { status },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["categoryName"],
        },
        {
          model: SubCategory,
          as: "subcategory",
          attributes: ["subCategoryName"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      products,
      totalProducts: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProductsByStatus,
  getProductStats,
  getProductCount,
  getProductById,
  getAllProducts,
};
