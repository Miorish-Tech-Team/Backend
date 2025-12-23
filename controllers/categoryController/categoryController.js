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

    await category.destroy();

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

const handleGetAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: SubCategory,
          as: "subcategories",
        },
      ],
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
      include: {
        model: SubCategory,
        as: "subcategories",
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
    const mainCategories = await Category.findAll({
      attributes: [
        "id",
        "categoryName",
        "categoryProductCount",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: SubCategory,
          as: "subcategories",
          attributes: [
            "id",
            "subCategoryName",
            "subCategoryProductCount",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
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
  handleUpdateCategory,
  handleAddCategory,
  getSingleCategoryWithSubcategories,
  getAllCategoriesWithProductCounts,
};
