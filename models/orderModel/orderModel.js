const { DataTypes } = require("sequelize");
const { sequelize } = require("../../mysqlConnection/dbConnection");
const Cart = require("../cartModel/cartModel");
const User = require("../authModel/userModel");
const CartItem = require("../cartModel/cartItemModel");
const Coupon = require("../couponModel/couponModel");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uniqueOrderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // User model reference
        key: "id",
      },
      onDelete: "CASCADE",
    },
    appliedCouponId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Coupon,
        key: "id",
      },
    },

    cartId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Cart, // Cart model reference
        key: "id",
      },
      onDelete: "CASCADE",
    },

    orderStatus: {
      type: DataTypes.ENUM(
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
      ),
      defaultValue: "Pending", // Default order status
    },

    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    addressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "addresses",
        key: "id",
      },
      onDelete: "SET NULL", // or 'CASCADE' if you want orders to delete when address is deleted
    },

    paymentStatus: {
      type: DataTypes.ENUM("Pending", "Completed", "Failed"),
      defaultValue: "Pending",
    },

    paymentMethod: {
      type: DataTypes.ENUM(
        "CreditCard",
        "DebitCard",
        "PayPal",
        "CashOnDelivery",
        "Razorpay"
      ),
      defaultValue: "CashOnDelivery",
    },

    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    shippingDate: {
      type: DataTypes.DATE,
    },

    deliveryDate: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    indexes: [
      // Index on uniqueOrderId for order lookups
      {
        name: 'idx_orders_unique_order_id',
        fields: ['uniqueOrderId']
      },
      // Index on userId for user order history
      {
        name: 'idx_orders_user_id',
        fields: ['userId']
      },
      // Index on orderStatus for filtering orders by status
      {
        name: 'idx_orders_status',
        fields: ['orderStatus']
      },
      // Index on paymentStatus for payment tracking
      {
        name: 'idx_orders_payment_status',
        fields: ['paymentStatus']
      },
      // Index on paymentMethod for payment method analytics
      {
        name: 'idx_orders_payment_method',
        fields: ['paymentMethod']
      },
      // Index on orderDate for date-based queries
      {
        name: 'idx_orders_order_date',
        fields: ['orderDate']
      },
      // Index on createdAt for sorting by creation time
      {
        name: 'idx_orders_created_at',
        fields: ['createdAt']
      },
      // Index on cartId for cart-to-order tracking
      {
        name: 'idx_orders_cart_id',
        fields: ['cartId']
      },
      // Index on addressId for address-based queries
      {
        name: 'idx_orders_address_id',
        fields: ['addressId']
      },
      // Index on appliedCouponId for coupon usage tracking
      {
        name: 'idx_orders_coupon_id',
        fields: ['appliedCouponId']
      },
      // Composite index for user and status queries
      {
        name: 'idx_orders_user_status',
        fields: ['userId', 'orderStatus']
      },
      // Composite index for user and order date
      {
        name: 'idx_orders_user_date',
        fields: ['userId', 'orderDate']
      },
      // Composite index for status and payment status
      {
        name: 'idx_orders_status_payment',
        fields: ['orderStatus', 'paymentStatus']
      },
      // Composite index for date range queries
      {
        name: 'idx_orders_dates',
        fields: ['orderDate', 'deliveryDate']
      }
    ]
  }
);

module.exports = Order;
