// Migration Script for Existing Addresses
// This script updates existing addresses to ensure they comply with Indian address validation

const Address = require("../../models/orderModel/orderAddressModel");
const { 
  validateState, 
  validateDistrict, 
  validatePincode 
} = require("../indianAddressService/indianAddressService");

/**
 * Migrate existing addresses to Indian format
 * This will:
 * 1. Set all countries to "India"
 * 2. Validate and fix state/district/pincode combinations
 * 3. Log any addresses that need manual review
 */
const migrateExistingAddresses = async () => {
  try {
    console.log("Starting address migration...");
    
    const addresses = await Address.findAll();
    console.log(`Found ${addresses.length} addresses to migrate`);
    
    const results = {
      updated: 0,
      needsReview: [],
      errors: []
    };
    
    for (const address of addresses) {
      try {
        let needsUpdate = false;
        let needsReview = false;
        const issues = [];
        
        // Force country to India
        if (address.country !== "India") {
          address.country = "India";
          needsUpdate = true;
        }
        
        // Validate state
        if (!validateState(address.state)) {
          issues.push(`Invalid state: ${address.state}`);
          needsReview = true;
        }
        
        // Validate district
        if (!validateDistrict(address.state, address.city)) {
          issues.push(`District ${address.city} does not belong to ${address.state}`);
          needsReview = true;
        }
        
        // Validate pincode
        const pincodeValidation = await validatePincode(address.postalCode);
        if (!pincodeValidation.isValid) {
          issues.push(`Invalid pincode: ${address.postalCode}`);
          needsReview = true;
        }
        
        // Save if only country needs update
        if (needsUpdate && !needsReview) {
          await address.save();
          results.updated++;
          console.log(`✓ Updated address ${address.id} - Set country to India`);
        }
        
        // Log if needs manual review
        if (needsReview) {
          results.needsReview.push({
            id: address.id,
            userId: address.userId,
            recipientName: address.recipientName,
            currentState: address.state,
            currentDistrict: address.city,
            currentPincode: address.postalCode,
            issues: issues
          });
          console.log(`⚠ Address ${address.id} needs review: ${issues.join(', ')}`);
        }
        
      } catch (error) {
        results.errors.push({
          addressId: address.id,
          error: error.message
        });
        console.error(`✗ Error processing address ${address.id}:`, error.message);
      }
    }
    
    // Print summary
    console.log("\n=== Migration Summary ===");
    console.log(`Total addresses: ${addresses.length}`);
    console.log(`Successfully updated: ${results.updated}`);
    console.log(`Needs manual review: ${results.needsReview.length}`);
    console.log(`Errors: ${results.errors.length}`);
    
    // Print addresses that need review
    if (results.needsReview.length > 0) {
      console.log("\n=== Addresses Needing Review ===");
      results.needsReview.forEach(addr => {
        console.log(`\nAddress ID: ${addr.id}`);
        console.log(`User ID: ${addr.userId}`);
        console.log(`Recipient: ${addr.recipientName}`);
        console.log(`Current: ${addr.currentState}, ${addr.currentDistrict}, ${addr.currentPincode}`);
        console.log(`Issues: ${addr.issues.join(', ')}`);
      });
    }
    
    // Print errors
    if (results.errors.length > 0) {
      console.log("\n=== Errors ===");
      results.errors.forEach(err => {
        console.log(`Address ${err.addressId}: ${err.error}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

/**
 * Validate all existing addresses without making changes
 * Use this to audit the current state of addresses
 */
const auditAddresses = async () => {
  try {
    console.log("Starting address audit...");
    
    const addresses = await Address.findAll();
    console.log(`Auditing ${addresses.length} addresses`);
    
    const report = {
      total: addresses.length,
      valid: 0,
      invalidCountry: 0,
      invalidState: 0,
      invalidDistrict: 0,
      invalidPincode: 0,
      details: []
    };
    
    for (const address of addresses) {
      const issues = [];
      
      if (address.country !== "India") {
        issues.push("Non-Indian country");
        report.invalidCountry++;
      }
      
      if (!validateState(address.state)) {
        issues.push("Invalid state");
        report.invalidState++;
      }
      
      if (!validateDistrict(address.state, address.city)) {
        issues.push("Invalid district");
        report.invalidDistrict++;
      }
      
      const pincodeValidation = await validatePincode(address.postalCode);
      if (!pincodeValidation.isValid) {
        issues.push("Invalid pincode");
        report.invalidPincode++;
      }
      
      if (issues.length === 0) {
        report.valid++;
      } else {
        report.details.push({
          id: address.id,
          userId: address.userId,
          state: address.state,
          district: address.city,
          pincode: address.postalCode,
          country: address.country,
          issues: issues
        });
      }
    }
    
    // Print report
    console.log("\n=== Audit Report ===");
    console.log(`Total addresses: ${report.total}`);
    console.log(`Valid addresses: ${report.valid} (${((report.valid/report.total)*100).toFixed(2)}%)`);
    console.log(`Invalid country: ${report.invalidCountry}`);
    console.log(`Invalid state: ${report.invalidState}`);
    console.log(`Invalid district: ${report.invalidDistrict}`);
    console.log(`Invalid pincode: ${report.invalidPincode}`);
    
    if (report.details.length > 0) {
      console.log("\n=== Invalid Addresses ===");
      report.details.forEach(addr => {
        console.log(`\nID: ${addr.id}, User: ${addr.userId}`);
        console.log(`Address: ${addr.state}, ${addr.district}, ${addr.pincode}, ${addr.country}`);
        console.log(`Issues: ${addr.issues.join(', ')}`);
      });
    }
    
    return report;
    
  } catch (error) {
    console.error("Audit failed:", error);
    throw error;
  }
};

// Export functions
module.exports = {
  migrateExistingAddresses,
  auditAddresses
};

// If running directly
if (require.main === module) {
  const action = process.argv[2] || 'audit';
  
  if (action === 'migrate') {
    migrateExistingAddresses()
      .then(() => {
        console.log("\nMigration completed!");
        process.exit(0);
      })
      .catch(err => {
        console.error("Migration failed:", err);
        process.exit(1);
      });
  } else if (action === 'audit') {
    auditAddresses()
      .then(() => {
        console.log("\nAudit completed!");
        process.exit(0);
      })
      .catch(err => {
        console.error("Audit failed:", err);
        process.exit(1);
      });
  } else {
    console.log("Usage: node addressMigration.js [audit|migrate]");
    console.log("  audit   - Check existing addresses without making changes");
    console.log("  migrate - Update addresses to comply with Indian validation");
    process.exit(1);
  }
}
