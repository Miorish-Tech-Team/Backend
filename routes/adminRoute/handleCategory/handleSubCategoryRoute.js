const express = require("express");
const router = express.Router();
const upload = require("../../../config/uploadComfig/upload");
const {
  handleCreateSubCategory,
  handleUpdateSubCategory,
  handleDeleteSubCategory,
  handleDeleteAllSubcategoriesByCategory,
  handleDeleteSelectedSubcategories,
} = require("../../../controllers/categoryController/subCategoryController");

router.delete("/subcategories/bulk-delete", handleDeleteSelectedSubcategories);
router.post(
  "/subcategories/create",
  ...upload.single("subCategoryImage"),
  handleCreateSubCategory
);

router.put(
  "/subcategories/:subCategoryId",
  ...upload.single("subCategoryImage"),
  handleUpdateSubCategory
);

router.delete("/subcategories/:subCategoryId", handleDeleteSubCategory);

router.delete(
  "/subcategories/category/:categoryId",
  handleDeleteAllSubcategoriesByCategory
);



module.exports = router;
