const express = require("express");
const router = express.Router();
const {
  getAllSubCategories,
  getSubCategoriesByCategory,
  getAllSubCategoriesWithProductCount,
} = require("../../controllers/categoryController/subCategoryController");


router.get("/subcategories", getAllSubCategories);

router.get("/subcategories-with-count", getAllSubCategoriesWithProductCount);

router.get("/subcategories/category/:categoryId", getSubCategoriesByCategory);

module.exports = router;
