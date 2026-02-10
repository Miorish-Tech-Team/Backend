const Cart = require('../../models/cartModel/cartModel');
const CartItem = require('../../models/cartModel/cartItemModel');
const Product = require('../../models/productModel/productModel');

const handleAddToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let { productId, quantity, selectedColor } = req.body;

    console.log("REQ BODY:", req.body);

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required.' });
    }

    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const maxAvailable = product.availableStockQuantity;

    // Check or create active cart
    let cart = await Cart.findOne({ where: { userId, status: 'active' } });
    if (!cart) {
      cart = await Cart.create({ userId, status: 'active' });
    }

    console.log("Cart ID:", cart.id);

    // Find cart item with matching productId and color
    let cartItem = await CartItem.findOne({ 
      where: { 
        cartId: cart.id, 
        productId,
        selectedColor: selectedColor || null
      } 
    });

    let newQuantity = quantity;
    if (cartItem) {
      newQuantity = cartItem.quantity + quantity;
    }

    if (newQuantity > maxAvailable) {
      return res.status(400).json({
        message: `Requested quantity (${newQuantity}) exceeds available stock (${maxAvailable}).`
      });
    }

    if (cartItem) {
      cartItem.quantity = newQuantity;
      cartItem.price = product.productDiscountPrice || product.productPrice;
      await cartItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.productDiscountPrice || product.productPrice,
        selectedColor: selectedColor || null,
      });
    }

    return res.status(200).json({ success: true, message: 'Product added to cart successfully' });

  } catch (error) {
    console.error('Add to Cart Error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};




const handleGetUserCartWithSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({
      where: { userId, status: 'active' },
      include: {
        model: CartItem,
        attributes: ['id', 'productId', 'selectedSize', 'selectedColor', 'quantity', 'price', 'totalPrice'],
        include: [{
          model: Product,
          attributes: ['id', 'productName', 'productBrand', 'productPrice', 'productDiscountPrice', 'coverImageUrl', 'availableStockQuantity']
        }],
      },
      attributes: ['id', 'userId']
    });

    if (!cart || cart.CartItems.length === 0) {
      return res.status(200).json({
        message: "Cart is empty",
        cart: [],
        summary: {
          totalItems: 0,
          totalPrice: 0,
        },
      });
    }

    const cartItems = cart.CartItems;
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => {
      const price = item.Product?.productDiscountPrice || item.Product?.productPrice || 0;
      return sum + item.quantity * price;
    }, 0);

    return res.status(200).json({
      cart: {
        id: cart.id,
        userId: cart.userId,
        CartItems: cart.CartItems
      },
      summary: {
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({
      message: "Error retrieving cart",
      error: error.message,
    });
  }
};


// 2. Remove Single Item
const handleRemoveCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const item = await CartItem.findOne({
      where: { id: itemId },
      include: {
        model: Cart,
        where: { userId }
      }
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found or unauthorized" });
    }

    await item.destroy();
    return res.status(200).json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error removing item", error: error.message });
  }
};

// 3. Update Quantity
const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const item = await CartItem.findOne({
      where: { id: itemId },
      include: [
        {
          model: Cart,
          where: { userId },
        },
        {
          model: Product, // Include product to check available stock
        },
      ],
    });

    if (!item) {
      return res.status(404).json({success: false, message: "Item not found or unauthorized" });
    }

    const availableStock = item.Product.availableStockQuantity;

    if (quantity > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${quantity}) exceeds available stock (${availableStock}).`,
      });
    }

    item.quantity = quantity;
    item.totalPrice = item.price * quantity;
    await item.save();

    return res.status(200).json({ success: true, message: "Quantity updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating quantity", error: error.message });
  }
};

const handleRemoveAllCartItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const userCart = await Cart.findOne({ where: { userId } });

    if (!userCart) {
      return res.status(404).json({ success: false, message: "Cart not found for user" });
    }

    const deletedCount = await CartItem.destroy({
      where: { cartId: userCart.id }
    });

    return res.status(200).json({
      success: true,
      message: `${deletedCount} item(s) deleted from cart`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete all cart items",
      error: error.message
    });
  }
};


  

  module.exports = {
    updateCartItemQuantity,
    handleRemoveCartItem,
    handleAddToCart,
    handleRemoveAllCartItems ,
    handleGetUserCartWithSummary
  }