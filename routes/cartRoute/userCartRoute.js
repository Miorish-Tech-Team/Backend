const express = require("express");
const { handleAddToCart, updateCartItemQuantity, handleRemoveCartItem, handleRemoveAllCartItems, handleGetUserCartWithSummary } = require("../../controllers/cartController/cartController");
const router = express.Router();


router.get('/cart-with-summery', handleGetUserCartWithSummary)
router.post('/cart/add',handleAddToCart)
router.put('/cart/update/:itemId',updateCartItemQuantity)
router.delete('/cart/remove/:itemId',handleRemoveCartItem)
router.delete('/cart/remove-all', handleRemoveAllCartItems);

module.exports = router;
