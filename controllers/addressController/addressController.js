const Address = require("../../models/orderModel/orderAddressModel");
const { sequelize } = require("../../mysqlConnection/dbConnection"); // for transactions
const {
  validateIndianAddress,
  getStates,
  getDistrictsByState,
  validatePincode,
  validatePincodeMatchesAddress
} = require("../../services/indianAddressService/indianAddressService");

const handleAddAddress = async (req, res) => {
  const {
    recipientName,
    street,
    city,
    state,
    postalCode,
    country,
    phoneNumber,
    type,
    isDefault,
    latitude,
    longitude,
  } = req.body;

  const userId = req.user.id;

  const t = await sequelize.transaction();

  try {
    // Force country to be India
    const addressCountry = "India";
    
    // First, validate that pincode matches state and district
    const addressMatch = await validatePincodeMatchesAddress(postalCode, state, city);
    
    if (!addressMatch.isValid) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Address mismatch detected',
        error: addressMatch.message,
        correctState: addressMatch.correctState,
        correctDistrict: addressMatch.correctDistrict
      });
    }
    
    // Then validate Indian address format
    const validation = await validateIndianAddress({
      state,
      district: city, // Using city as district
      postalCode,
      country: addressCountry
    });
    
    if (!validation.isValid) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Address validation failed',
        errors: validation.errors
      });
    }

    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId }, transaction: t }
      );
    }

    const newAddress = await Address.create(
      {
        userId,
        recipientName,
        street,
        city,
        state,
        postalCode,
        country: addressCountry,
        phoneNumber,
        type,
        isDefault: !!isDefault,
        latitude,
        longitude,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({ success: true, address: newAddress });
  } catch (error) {
    await t.rollback();
    console.error("Add Address Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while adding address",
        error: error.message,
      });
  }
};

const handleGetUserAddresses = async (req, res) => {
  const userId = req.user.id;

  try {
    const addresses = await Address.findAll({
      where: { userId },
      order: [["isDefault", "DESC"]],
    });

    res.status(200).json({ success: true,message:"user address added successfult", addresses });
  } catch (error) {
    console.error("Get Addresses Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching addresses",
        error: error.message,
      });
  }
};

const handleUpdateAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;
  const {
    recipientName,
    street,
    city,
    state,
    postalCode,
    country,
    phoneNumber,
    type,
    isDefault,
    latitude,
    longitude,
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const address = await Address.findOne({ where: { id: addressId, userId } });
    if (!address) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Force country to be India
    const addressCountry = "India";
    
    // First, validate that pincode matches state and district
    const addressMatch = await validatePincodeMatchesAddress(postalCode, state, city);
    
    if (!addressMatch.isValid) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Address mismatch detected',
        error: addressMatch.message,
        correctState: addressMatch.correctState,
        correctDistrict: addressMatch.correctDistrict
      });
    }
    
    // Then validate Indian address format
    const validation = await validateIndianAddress({
      state,
      district: city, // Using city as district
      postalCode,
      country: addressCountry
    });
    
    if (!validation.isValid) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Address validation failed',
        errors: validation.errors
      });
    }

    if (isDefault === true) {
      await Address.update({ isDefault: false }, { where: { userId }, transaction: t });
    }

    await address.update(
      {
        recipientName,
        street,
        city,
        state,
        postalCode,
        country: addressCountry,
        phoneNumber,
        type,
        isDefault,
        latitude,
        longitude,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({ success: true, address });
  } catch (error) {
    await t.rollback();
    console.error('Update Address Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating address', error: error.message });
  }
};

// Delete an address
const handleDeleteAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;

  try {
    const address = await Address.findOne({ where: { id: addressId, userId } });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    await address.destroy();
    res
      .status(200)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete Address Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while deleting address",
        error: error.message,
      });
  }
};

const handleSetDefaultAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;

  const t = await sequelize.transaction();

  try {
    // Reset all addresses to non-default for this user
    await Address.update(
      { isDefault: false },
      { where: { userId }, transaction: t }
    );
    // Find the address to set as default
    const address = await Address.findOne({
      where: { id: addressId, userId },
      transaction: t,
    });
    if (!address) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    await address.update({ isDefault: true }, { transaction: t });
    await t.commit();

    res
      .status(200)
      .json({ success: true, message: "Address marked as default", address });
  } catch (error) {
    await t.rollback();
    console.error("Set Default Address Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while setting default address",
        error: error.message,
      });
  }
};

// Get all Indian states
const handleGetStates = async (req, res) => {
  try {
    const states = getStates();
    res.status(200).json({ 
      success: true, 
      states,
      country: "India"
    });
  } catch (error) {
    console.error('Get States Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching states', 
      error: error.message 
    });
  }
};

// Get districts by state
const handleGetDistricts = async (req, res) => {
  const { state } = req.query;
  
  try {
    if (!state) {
      return res.status(400).json({ 
        success: false, 
        message: 'State parameter is required' 
      });
    }
    
    const districts = getDistrictsByState(state);
    
    if (districts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid state or no districts found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      state,
      districts 
    });
  } catch (error) {
    console.error('Get Districts Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching districts', 
      error: error.message 
    });
  }
};

// Validate pincode
const handleValidatePincode = async (req, res) => {
  const { pincode } = req.query;
  
  try {
    if (!pincode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pincode parameter is required' 
      });
    }
    
    const validation = await validatePincode(pincode);
    
    res.status(200).json({ 
      success: validation.isValid, 
      ...validation
    });
  } catch (error) {
    console.error('Validate Pincode Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while validating pincode', 
      error: error.message 
    });
  }
};

module.exports = {
  handleAddAddress,
  handleGetUserAddresses,
  handleUpdateAddress,
  handleDeleteAddress,
  handleSetDefaultAddress,
  handleGetStates,
  handleGetDistricts,
  handleValidatePincode,
};
