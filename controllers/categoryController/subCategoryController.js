const SubCategory = require("../../models/categoryModel/subCategoryModel");
const Category = require("../../models/categoryModel/categoryModel");
const Product = require("../../models/productModel/productModel");

const handleCreateSubCategory = async (req, res) => {
  try {
    const { subCategoryName, subCategoryDescription, categoryId } = req.body;
    const subCategoryImageUrl = req.fileUrl;

    if (!subCategoryImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload a cover image",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if subcategory already exists
    const existing = await SubCategory.findOne({
      where: { subCategoryName, categoryId },
    });
    if (existing) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    const subCategory = await SubCategory.create({
      subCategoryName,
      subCategoryDescription,
      subCategoryImage: subCategoryImageUrl,
      categoryId,
    });

    return res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      subCategory,
    });
  } catch (error) {
    console.error("Create SubCategory Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const handleUpdateSubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.subCategoryId;
    const { subCategoryName, subCategoryDescription, categoryId } = req.body;

    const subCategory = await SubCategory.findByPk(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }   

    // If categoryId is being updated, check if the new category exists
    if (categoryId && categoryId !== subCategory.categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      subCategory.categoryId = categoryId;
    }

    subCategory.subCategoryName = subCategoryName ?? subCategory.subCategoryName;
    subCategory.subCategoryDescription =
      subCategoryDescription ?? subCategory.subCategoryDescription;

    // Only update image if a new one is uploaded
    if (req.fileUrl) {
      subCategory.subCategoryImage = req.fileUrl;
    }

    await subCategory.save();

    return res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      subCategory,
    });
  } catch (error) {
    console.error("Update SubCategory Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const handleDeleteSubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.subCategoryId;

    const subCategory = await SubCategory.findByPk(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    // Check if there are products using this subcategory
    const Product = require("../../models/productModel/productModel");
    const productCount = await Product.count({
      where: { productSubCategoryId: subCategoryId },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subcategory. ${productCount} product(s) are still using this subcategory. Please reassign or delete those products first.`,
        productCount,
      });
    }

    await subCategory.destroy();

    return res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.error("Delete SubCategory Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
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
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryName"],
        },
      ],
      order: [['categoryId', 'ASC'], ['subCategoryName', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      subCategories,
    });
  } catch (error) {
    console.error("Get All SubCategories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getSubCategoriesByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const category = await Category.findByPk(categoryId, {
      attributes: ['id', 'categoryName']
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subCategories = await SubCategory.findAll({
      where: { categoryId },
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
    });

    return res.status(200).json({
      success: true,
      subCategories,
    });
  } catch (error) {
    console.error("Get SubCategories By Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllSubCategoriesWithProductCount = async (req, res) => {
  try {
    const { sequelize } = require("../../mysqlConnection/dbConnection");
    const Product = require("../../models/productModel/productModel");

    const subCategories = await SubCategory.findAll({
      attributes: [
        "id",
        "subCategoryName",
        "subCategoryDescription",
        "subCategoryImage",
        "categoryId",
        "createdAt",
        "updatedAt",
        [sequelize.literal('(SELECT COUNT(*) FROM products WHERE products.productSubCategoryId = SubCategory.id)'), 'subCategoryProductCount']
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryName"],
        },
      ],
      order: [['categoryId', 'ASC'], ['subCategoryName', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      subCategories,
    });
  } catch (error) {
    console.error("Get All SubCategories With Product Count Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const handleDeleteAllSubcategoriesByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await SubCategory.destroy({ where: { categoryId } });

    return res.status(200).json({
      success: true,
      message: "All subcategories deleted successfully",
    });
  } catch (error) {
    console.error("Delete All Subcategories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const handleDeleteSelectedSubcategories = async (req, res) => {
  try {
    const { subcategoryIds } = req.body;

    if (!Array.isArray(subcategoryIds) || subcategoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No subcategory IDs provided",
      });
    }

    await SubCategory.destroy({
      where: {
        id: subcategoryIds,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Selected subcategories deleted successfully",
    });
  } catch (error) {
    console.error("Delete Selected Subcategories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  handleCreateSubCategory,
  handleUpdateSubCategory,
  handleDeleteSubCategory,
  getAllSubCategories,
  getSubCategoriesByCategory,
  getAllSubCategoriesWithProductCount,
  handleDeleteAllSubcategoriesByCategory,
  handleDeleteSelectedSubcategories,
};
