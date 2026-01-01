const axios = require("axios");
const redis = require("../../config/redisConfig/redisConfig");
const { User } = require("../../models/authModel/userModel");
const WarehouseAddress = require("../../models/deliveryModel/adminWarehouseAdd");
const Address = require("../../models/orderModel/orderAddressModel");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Get distance and duration using Google Maps Distance Matrix API
 * @param {string} origin - Origin address (warehouse)
 * @param {string} destination - Destination address (user)
 * @returns {Promise<Object>} - Distance in km and duration in seconds
 */
const getDistanceFromGoogleMaps = async (origin, destination) => {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: origin,
          destinations: destination,
          mode: "driving",
          units: "metric",
          key: GOOGLE_MAPS_API_KEY,
          region: "in", // Optimize for India
        },
      }
    );

    if (response.data.status !== "OK") {
      console.error("Google Maps API error:", response.data.status);
      return null;
    }

    const element = response.data.rows[0]?.elements[0];

    if (!element || element.status !== "OK") {
      console.error("Distance calculation failed:", element?.status);
      return null;
    }

    return {
      distanceMeters: element.distance.value,
      distanceKm: element.distance.value / 1000,
      durationSeconds: element.duration.value,
      distanceText: element.distance.text,
      durationText: element.duration.text,
    };
  } catch (err) {
    console.error("Google Maps Distance Matrix API error:", err.message);
    return null;
  }
};

/**
 * Format address for Google Maps API
 */
const formatAddressForGoogleMaps = (address) => {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  return parts.join(", ");
};

// Main controller: Get delivery estimate
const getDeliveryEstimate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId, orderTotal } = req.body;

    // Validate inputs
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }

    // Get user address
    const userAddress = await Address.findOne({
      where: { userId, id: addressId },
    });

    if (!userAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Validate India only
    if (
      !userAddress.country ||
      userAddress.country.toLowerCase() !== "india"
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery is only available in India",
      });
    }

    if (!userAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: "Address must have a valid postal code",
      });
    }

    const userPincode = userAddress.postalCode;

    // Get primary warehouse
    const warehouse = await WarehouseAddress.findOne({
      where: { isPrimary: true },
    });

    if (!warehouse || !warehouse.pinCode) {
      return res.status(500).json({
        success: false,
        message: "Warehouse configuration error",
      });
    }

    const warehousePincode = warehouse.pinCode;
    const warehouseVersion = warehouse.updatedAt ? warehouse.updatedAt.getTime() : Date.now();

    // Check Redis cache with userId and addressId
    const cacheKey = `delivery:user:${userId}:address:${addressId}:warehouse:${warehouse.id}`;
    const cachedEstimate = await redis.get(cacheKey);

    if (cachedEstimate) {
      // Validate cache is still valid (address hasn't been updated)
      const addressUpdatedAt = userAddress.updatedAt ? userAddress.updatedAt.getTime() : 0;
      const cachedAddressVersion = cachedEstimate.addressVersion || 0;
      const cachedWarehouseVersion = cachedEstimate.warehouseVersion || 0;

      // If address or warehouse has been updated, invalidate cache
      if (addressUpdatedAt > cachedAddressVersion || warehouseVersion > cachedWarehouseVersion) {
        await redis.del(cacheKey);
      } else {
        // Calculate shipping cost based on order total
        const shippingCost =
          orderTotal && orderTotal >= 1000 ? 0 : cachedEstimate.shippingCost;

        return res.status(200).json({
          success: true,
          source: "cache",
          estimate: {
            ...cachedEstimate,
            shippingCost,
            isFreeShipping: orderTotal && orderTotal >= 1000,
          },
        });
      }
    }

    // Format addresses for Google Maps API
    const warehouseFullAddress = formatAddressForGoogleMaps({
      street: warehouse.addressLine || warehouse.warehouseName,
      city: warehouse.city,
      state: warehouse.state,
      postalCode: warehouse.pinCode,
      country: warehouse.countryName,
    });

    const userFullAddress = formatAddressForGoogleMaps({
      street: userAddress.street,
      city: userAddress.city,
      state: userAddress.state,
      postalCode: userAddress.postalCode,
      country: userAddress.country,
    });

    // Get distance using Google Maps Distance Matrix API
    const distanceData = await getDistanceFromGoogleMaps(
      warehouseFullAddress,
      userFullAddress
    );

    if (!distanceData) {
      return res.status(400).json({
        success: false,
        message: "Unable to calculate delivery distance. Please verify your address.",
      });
    }

    const distanceKm = distanceData.distanceKm;

    // Determine delivery days and shipping cost based on distance
    let deliveryDays;
    let baseShippingCost;

    if (distanceKm <= 50) {
      deliveryDays = 2;
      baseShippingCost = 60;
    } else if (distanceKm <= 100) {
      deliveryDays = 4;
      baseShippingCost = 80;
    } else {
      deliveryDays = 7;
      baseShippingCost = 120;
    }

    // Calculate expected delivery date
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    const estimateData = {
      userId,
      addressId,
      distanceKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
      distanceText: distanceData.distanceText,
      durationText: distanceData.durationText,
      deliveryDays,
      shippingCost: baseShippingCost,
      estimatedDeliveryDate: deliveryDate.toISOString().split("T")[0],
      warehouseLocation: {
        pincode: warehousePincode,
        name: warehouse.warehouseName,
        id: warehouse.id,
      },
      addressVersion: userAddress.updatedAt ? userAddress.updatedAt.getTime() : Date.now(),
      warehouseVersion,
      cachedAt: new Date().toISOString(),
      calculationMethod: "google_maps_distance_matrix",
    };

    // Cache for 30 days (2592000 seconds) - will auto-invalidate on address/warehouse update
    await redis.set(cacheKey, JSON.stringify(estimateData), { ex: 2592000 });

    // Calculate final shipping cost
    const finalShippingCost =
      orderTotal && orderTotal >= 1000 ? 0 : baseShippingCost;

    return res.status(200).json({
      success: true,
      source: "fresh",
      estimate: {
        ...estimateData,
        shippingCost: finalShippingCost,
        isFreeShipping: orderTotal && orderTotal >= 1000,
      },
    });
  } catch (err) {
    console.error("Delivery estimate error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate delivery estimate",
      error: err.message,
    });
  }
};

// Clear cache for a specific user (when address is deleted or warehouse changes)
const clearDeliveryCache = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    let deletedCount = 0;

    if (addressId) {
      // Clear cache for specific user and address
      const keys = await redis.keys(`delivery:user:${userId}:address:${addressId}:*`);
      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key) => redis.del(key)));
        deletedCount = keys.length;
      }
    } else {
      // Clear all delivery caches for this user
      const keys = await redis.keys(`delivery:user:${userId}:*`);
      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key) => redis.del(key)));
        deletedCount = keys.length;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Cache cleared successfully. Deleted ${deletedCount} cache entries.`,
    });
  } catch (err) {
    console.error("Clear cache error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cache",
    });
  }
};

// Clear all delivery caches when warehouse is updated (admin utility)
const clearAllDeliveryCaches = async (req, res) => {
  try {
    const keys = await redis.keys("delivery:user:*");
    
    if (!keys || keys.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No caches to clear",
      });
    }

    await Promise.all(keys.map((key) => redis.del(key)));

    return res.status(200).json({
      success: true,
      message: `Cleared ${keys.length} delivery cache entries`,
    });
  } catch (err) {
    console.error("Clear all caches error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to clear caches",
    });
  }
};

module.exports = {
  getDeliveryEstimate,
  clearDeliveryCache,
  clearAllDeliveryCaches,
};
