/**
 * Simple migration to add Razorpay to existing enum (keeps old values)
 * Use this if you have existing orders with old payment methods
 * 
 * Usage: node migrations/addRazorpayToEnum.js
 */

const { sequelize } = require('../mysqlConnection/dbConnection');

async function addRazorpayToEnum() {
  try {
    console.log('Adding Razorpay to paymentMethod enum...');

    await sequelize.query(`
      ALTER TYPE "enum_orders_paymentMethod" 
      ADD VALUE IF NOT EXISTS 'Razorpay';
    `);

    console.log('✅ Successfully added Razorpay to paymentMethod enum!');
    console.log('The enum now accepts: CreditCard, DebitCard, PayPal, CashOnDelivery, Razorpay\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

addRazorpayToEnum();
