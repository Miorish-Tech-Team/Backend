const { Op } = require("sequelize");
const Category = require("../../models/categoryModel/categoryModel");
const SubCategory = require("../../models/categoryModel/subCategoryModel");
const Product = require("../../models/productModel/productModel");
const { sequelize } = require("../../mysqlConnection/dbConnection");

const handleAddCategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription } = req.body;
    const categoryImageUrl = req.fileUrl;
    if (!categoryImageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload an cover image" });
    }
    const existing = await Category.findOne({ where: { categoryName } });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      categoryName,
      categoryDescription,
      categoryImage: categoryImageUrl,
    });

    return res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

const handleUpdateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { categoryName, categoryDescription } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    console.log("Current category image:", category.categoryImage);

    category.categoryName = categoryName ?? category.categoryName;
    category.categoryDescription =
      categoryDescription ?? category.categoryDescription;

    // Only update image if a new one is uploaded
    if (req.fileUrl) {
      console.log("Updating image to:", req.fileUrl);
      category.categoryImage = req.fileUrl;
    } else {
      console.log("No new image uploaded, keeping existing image");
    }

    await category.save();

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const handleDeleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if there are products using this category
    const productCount = await Product.count({
      where: { productCategoryId: categoryId },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productCount} product(s) are still using this category. Please reassign or delete those products first.`,
        productCount,
      });
    }

    // Delete all subcategories associated with this category first
    const deletedSubcategories = await SubCategory.destroy({
      where: { categoryId: categoryId },
    });

    // Now delete the category
    await category.destroy();

    return res.status(200).json({ 
      success: true,
      message: "Category deleted successfully",
      deletedSubcategories 
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const handleBulkDeleteCategories = async (req, res) => {
  try {
    const { categoryIds } = req.body;

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No category IDs provided",
      });
    }

    // Check if any category has products
    const productCount = await Product.count({
      where: { productCategoryId: categoryIds },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete categories. ${productCount} product(s) are still using these categories. Please reassign or delete those products first.`,
        productCount,
      });
    }

    // Delete all subcategories associated with these categories first
    const deletedSubcategories = await SubCategory.destroy({
      where: { categoryId: categoryIds },
    });

    // Delete the categories
    const deletedCategories = await Category.destroy({
      where: { id: categoryIds },
    });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCategories} category(ies) and ${deletedSubcategories} subcategory(ies)`,
      deletedCategories,
      deletedSubcategories,
    });
  } catch (error) {
    console.error("Bulk Delete Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const handleGetAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: [
        'id',
        'categoryName',
        'categoryDescription',
        'categoryImage',
        'categoryProductCount',
        'createdAt',
        'updatedAt'
      ],
      include: [
        {
          model: SubCategory,
          as: "subcategories",
          attributes: [
            'id',
            'subCategoryName',
            'subCategoryDescription',
            'subCategoryImage',
            'subCategoryProductCount',
            'categoryId'
          ],
        },
      ],
      order: [['categoryName', 'ASC']],
    });

    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

const getSingleCategoryWithSubcategories = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      attributes: [
        'id',
        'categoryName',
        'categoryDescription',
        'categoryImage',
        'categoryProductCount',
        'createdAt',
        'updatedAt'
      ],
      include: {
        model: SubCategory,
        as: "subcategories",
        attributes: [
          'id',
          'subCategoryName',
          'subCategoryDescription',
          'subCategoryImage',
          'subCategoryProductCount',
          'categoryId',
          'createdAt',
          'updatedAt'
        ],
        order: [['subCategoryName', 'ASC']],
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllCategoriesWithProductCounts = async (req, res) => {
  try {
    const { sequelize } = require("../../mysqlConnection/dbConnection");
    const Product = require("../../models/productModel/productModel");

    const mainCategories = await Category.findAll({
      attributes: [
        "id",
        "categoryName",
        "categoryDescription",
        "categoryImage",
        "createdAt",
        "updatedAt",
        [sequelize.literal('(SELECT COUNT(*) FROM products WHERE products.productCategoryId = Category.id)'), 'categoryProductCount']
      ],
      include: [
        {
          model: SubCategory,
          as: "subcategories",
          attributes: [
            "id",
            "subCategoryName",
            "subCategoryDescription",
            "subCategoryImage",
            "categoryId",
            "createdAt",
            "updatedAt",
            [sequelize.literal('(SELECT COUNT(*) FROM products WHERE products.productSubCategoryId = subcategories.id)'), 'subCategoryProductCount']
          ],
        },
      ],
      order: [['categoryName', 'ASC'], [{ model: SubCategory, as: 'subcategories' }, 'subCategoryName', 'ASC']],
    });

    res.status(200).json({ categories: mainCategories });
  } catch (error) {
    console.error("Error fetching categories with product counts:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  handleGetAllCategories,
  handleDeleteCategory,
  handleBulkDeleteCategories,
  handleUpdateCategory,
  handleAddCategory,
  getSingleCategoryWithSubcategories,
  getAllCategoriesWithProductCounts,
};
