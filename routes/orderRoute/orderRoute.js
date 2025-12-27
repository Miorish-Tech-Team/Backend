const express = require('express');
const { 
  handleBuyNow, 
  handlePlaceOrderFromCart, 
  handlePlaceOrderFromSelectedCartItems,
  handleGetUserOrders, 
  handleGetSingleOrderDetails 
} = require('../../controllers/orderController/orderController');
const router = express.Router();

router.post('/order/buy-now',  handleBuyNow);
router.post('/order/place-order-from-cart', handlePlaceOrderFromCart);
router.post('/order/place-order-from-selected-items', handlePlaceOrderFromSelectedCartItems);
router.get('/my-orders',  handleGetUserOrders);
router.get('/my-orders/:orderId',  handleGetSingleOrderDetails);

module.exports = router;
