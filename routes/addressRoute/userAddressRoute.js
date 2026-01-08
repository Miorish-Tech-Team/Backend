const express = require('express');
const { 
  handleAddAddress, 
  handleGetUserAddresses, 
  handleUpdateAddress, 
  handleDeleteAddress, 
  handleSetDefaultAddress,
  handleGetStates,
  handleGetDistricts,
  handleValidatePincode
} = require('../../controllers/addressController/addressController');
const router = express.Router();

// Indian address helper routes (public - no auth required)
router.get('/address/states', handleGetStates);
router.get('/address/districts', handleGetDistricts);
router.get('/address/validate-pincode', handleValidatePincode);

// Protected address management routes
router.post('/address/add',handleAddAddress);
router.get('/address',  handleGetUserAddresses);
router.put('/address/:addressId',  handleUpdateAddress);
router.delete('/address/:addressId', handleDeleteAddress);
router.patch('/address/:addressId/default', handleSetDefaultAddress);

module.exports = router;
