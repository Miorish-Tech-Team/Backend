/**
 * Migration script to update paymentMethod enum in orders table
 * Run this script once to update the database enum values
 * 
 * Usage: node migrations/updatePaymentMethodEnum.js
 */

const { sequelize } = require('../mysqlConnection/dbConnection');

async function updatePaymentMethodEnum() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('Starting migration to update paymentMethod enum...');

    // For PostgreSQL, we need to:
    // 1. Add new enum values
    // 2. Update existing records if needed
    // 3. Remove old enum values (optional, can cause issues if there's existing data)

    // Step 1: Add 'Razorpay' to the enum
    await sequelize.query(`
      ALTER TYPE "enum_orders_paymentMethod" 
      ADD VALUE IF NOT EXISTS 'Razorpay';
    `);
    console.log('✓ Added Razorpay to enum');

    // Step 2: If you want to remove old values, you need to:
    // - Create a new enum type
    // - Alter the column to use the new type
    // - Drop the old enum type
    
    // Create new enum type with only CashOnDelivery and Razorpay
    await sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_paymentmethod_new') THEN
          CREATE TYPE "enum_orders_paymentMethod_new" AS ENUM ('CashOnDelivery', 'Razorpay');
        END IF;
      END $$;
    `);
    console.log('✓ Created new enum type');

    // Alter the column to use the new enum type
    await sequelize.query(`
      ALTER TABLE orders 
      ALTER COLUMN "paymentMethod" TYPE "enum_orders_paymentMethod_new" 
      USING "paymentMethod"::text::"enum_orders_paymentMethod_new";
    `);
    console.log('✓ Updated column to use new enum type');

    // Drop the old enum type
    await sequelize.query(`
      DROP TYPE IF EXISTS "enum_orders_paymentMethod";
    `);
    console.log('✓ Dropped old enum type');

    // Rename the new enum type to the original name
    await sequelize.query(`
      ALTER TYPE "enum_orders_paymentMethod_new" RENAME TO "enum_orders_paymentMethod";
    `);
    console.log('✓ Renamed new enum type');

    console.log('\n✅ Migration completed successfully!');
    console.log('The paymentMethod enum now only accepts: CashOnDelivery, Razorpay\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

// Run the migration
updatePaymentMethodEnum();
