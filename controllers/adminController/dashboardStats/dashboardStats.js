const User = require("../../../models/authModel/userModel");
const Seller = require("../../../models/authModel/sellerModel");
const Product = require("../../../models/productModel/productModel");

// Get total count of customers (users with role 'user')
const getCustomersCount = async (req, res) => {
  try {
    const count = await User.count({
      where: {
        role: "user",
      },
    });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total count of sellers (users with role 'seller')
const getSellersCount = async (req, res) => {
  try {
    const count = await Seller.count({
      where: {
        isVerified: true,
      },
    });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total count of products
const getProductsCount = async (req, res) => {
  try {
    const count = await Product.count();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all dashboard stats in one request
const getAllDashboardStats = async (req, res) => {
  try {
    const [customersCount, sellersCount, productsCount] = await Promise.all([
      User.count({
        where: {
          role: "user",
        },
      }),
      Seller.count({
        where: {
          isVerified: true,
        },
      }),
      Product.count(),
    ]);

    res.status(200).json({
      customers: customersCount,
      sellers: sellersCount,
      products: productsCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCustomersCount,
  getSellersCount,
  getProductsCount,
  getAllDashboardStats,
};
