const express = require('express');
const { addToWishlist, getWishlist, removeFromWishlist, removeFromWishlistByProductId } = require('../../controllers/wishlistController/wishlistController');

const router = express.Router();

router.post('/wishlist/add',addToWishlist);
router.get('/wishlist',  getWishlist);
router.delete('/wishlist/remove',removeFromWishlist);
router.delete('/wishlist/remove-product', removeFromWishlistByProductId);

module.exports = router;
