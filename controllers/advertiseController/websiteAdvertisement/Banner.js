const BrandPoster = require("../../../models/advertisementModel/websiteAdvertisement/brandAdsPoster");
const HomepageBanner = require("../../../models/advertisementModel/websiteAdvertisement/homepageBanner");
const ProductPosterAds = require("../../../models/advertisementModel/websiteAdvertisement/productPosterAds");
const ThePopular = require("../../../models/advertisementModel/websiteAdvertisement/thepopular");
const WeeklyPromotion = require("../../../models/advertisementModel/websiteAdvertisement/weeklyPromotion");

const handleAddHomepageBanner = async (req, res) => {
  try {
    const { title } = req.body;
    const imageURL = req.fileUrl;
    if (!imageURL) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload an image" });
    }

    const banner = await HomepageBanner.create({
      title,
      image: imageURL,
    });

    return res.status(201).json({
      success: true,
      message: "Image added successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in handleAddHomepageBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleAddWeeklyPromotionBanner = async (req, res) => {
  try {
    const { title } = req.body;
    const imageURL = req.fileUrl;
    if (!imageURL) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload an image" });
    }

    const banner = await WeeklyPromotion.create({
      title,
      image: imageURL,
    });

    return res.status(201).json({
      success: true,
      message: "Image added successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in handleAddWeeklyPromotionBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleAddThePopularBanner = async (req, res) => {
  try {
    const { title } = req.body;
    const imageURL = req.fileUrl;
    if (!imageURL) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload an image" });
    }

    const banner = await ThePopular.create({
      title,
      image: imageURL,
    });

    return res.status(201).json({
      success: true,
      message: "Image added successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in handleAddThePopularBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const handleAddBrandAdsPosterBanner = async (req, res) => {
  try {
    const { title } = req.body;
    const imageURL = req.fileUrl;
    if (!imageURL) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload an image" });
    }

    const banner = await BrandPoster.create({
      title,
      image: imageURL,
    });

    return res.status(201).json({
      success: true,
      message: "Image added successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in handleAddBrandPosterBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleAddProductPosterAdsBanner = async (req, res) => {
  try {
    const { title } = req.body;
    const imageURL = req.fileUrl;
    if (!imageURL) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload an image" });
    }

    const banner = await ProductPosterAds.create({
      title,
      image: imageURL,
    });

    return res.status(201).json({
      success: true,
      message: "Image added successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in handleAddProductPosterAdsBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


const getHomepageBanners = async (req, res) => {
  try {
    const banners = await HomepageBanner.findAll({
      order: [["createdAt", "DESC"]],
      limit: 3,
    });

    return res.status(200).json({
      success: true,
      message: "Last 5 Homepage banners fetched successfully",
      banners,
    });
  } catch (error) {
    console.error("Error in getHomepageBanners:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getWeeklyPromotionBanners = async (req, res) => {
  try {
    const banners = await WeeklyPromotion.findAll({
      order: [["createdAt", "DESC"]],
      limit: 4,
    });

    return res.status(200).json({
      success: true,
      message: "Last 5 Weekly Promotion banners fetched successfully",
      banners,
    });
  } catch (error) {
    console.error("Error in getWeeklyPromotionBanners:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


const getThePopularBanners = async (req, res) => {
  try {
    const banners = await ThePopular.findAll({
      order: [["createdAt", "DESC"]],
      limit: 1,
    });

    return res.status(200).json({
      success: true,
      message: "Last 5 The Popular banners fetched successfully",
      banners,
    });
  } catch (error) {
    console.error("Error in getThePopularBanners:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getBrandPosterBanners = async (req, res) => {
  try {
    const banners = await BrandPoster.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    return res.status(200).json({
      success: true,
      message: "Last 5 Brand Poster banners fetched successfully",
      banners,
    });
  } catch (error) {
    console.error("Error in getBrandPosterBanners:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


const getProductPosterAdsBanners = async (req, res) => {
  try {
    const banners = await ProductPosterAds.findAll({
      order: [["createdAt", "DESC"]],
      limit: 4,
    });

    return res.status(200).json({
      success: true,
      message: "Last 5 Product Poster Ads banners fetched successfully",
      banners,
    });
  } catch (error) {
    console.error("Error in getProductPosterAdsBanners:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete Controllers
const handleDeleteHomepageBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await HomepageBanner.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Homepage banner not found",
      });
    }

    await banner.destroy();

    return res.status(200).json({
      success: true,
      message: "Homepage banner deleted successfully",
    });
  } catch (error) {
    console.error("Error in handleDeleteHomepageBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleDeleteWeeklyPromotionBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await WeeklyPromotion.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Weekly Promotion banner not found",
      });
    }

    await banner.destroy();

    return res.status(200).json({
      success: true,
      message: "Weekly Promotion banner deleted successfully",
    });
  } catch (error) {
    console.error("Error in handleDeleteWeeklyPromotionBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleDeleteThePopularBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await ThePopular.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "The Popular banner not found",
      });
    }

    await banner.destroy();

    return res.status(200).json({
      success: true,
      message: "The Popular banner deleted successfully",
    });
  } catch (error) {
    console.error("Error in handleDeleteThePopularBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleDeleteBrandPosterBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await BrandPoster.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Brand Poster banner not found",
      });
    }

    await banner.destroy();

    return res.status(200).json({
      success: true,
      message: "Brand Poster banner deleted successfully",
    });
  } catch (error) {
    console.error("Error in handleDeleteBrandPosterBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleDeleteProductPosterAdsBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await ProductPosterAds.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Product Poster Ads banner not found",
      });
    }

    await banner.destroy();

    return res.status(200).json({
      success: true,
      message: "Product Poster Ads banner deleted successfully",
    });
  } catch (error) {
    console.error("Error in handleDeleteProductPosterAdsBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update Controllers
const handleUpdateHomepageBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const imageURL = req.fileUrl;

    const banner = await HomepageBanner.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Homepage banner not found",
      });
    }

    // Update fields
    if (title) banner.title = title;
    if (imageURL) banner.image = imageURL;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Homepage banner updated successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in handleUpdateHomepageBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleUpdateWeeklyPromotionBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const imageURL = req.fileUrl;

    const banner = await WeeklyPromotion.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Weekly Promotion banner not found",
      });
    }

    // Update fields
    if (title) banner.title = title;
    if (imageURL) banner.image = imageURL;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Weekly Promotion banner updated successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in handleUpdateWeeklyPromotionBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleUpdateThePopularBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const imageURL = req.fileUrl;

    const banner = await ThePopular.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "The Popular banner not found",
      });
    }

    // Update fields
    if (title) banner.title = title;
    if (imageURL) banner.image = imageURL;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "The Popular banner updated successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in handleUpdateThePopularBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleUpdateBrandPosterBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const imageURL = req.fileUrl;

    const banner = await BrandPoster.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Brand Poster banner not found",
      });
    }

    // Update fields
    if (title) banner.title = title;
    if (imageURL) banner.image = imageURL;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Brand Poster banner updated successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in handleUpdateBrandPosterBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const handleUpdateProductPosterAdsBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const imageURL = req.fileUrl;

    const banner = await ProductPosterAds.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Product Poster Ads banner not found",
      });
    }

    // Update fields
    if (title) banner.title = title;
    if (imageURL) banner.image = imageURL;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Product Poster Ads banner updated successfully",
      banner,
    });
  } catch (error) {
    console.error("Error in handleUpdateProductPosterAdsBanner:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



module.exports = {
  handleAddHomepageBanner,
  handleAddWeeklyPromotionBanner,
  handleAddThePopularBanner,
  handleAddBrandAdsPosterBanner,
  handleAddProductPosterAdsBanner,
  getProductPosterAdsBanners,
  getHomepageBanners,
  getThePopularBanners,
  getWeeklyPromotionBanners,
  getBrandPosterBanners,
  handleDeleteHomepageBanner,
  handleDeleteWeeklyPromotionBanner,
  handleDeleteThePopularBanner,
  handleDeleteBrandPosterBanner,
  handleDeleteProductPosterAdsBanner,
  handleUpdateHomepageBanner,
  handleUpdateWeeklyPromotionBanner,
  handleUpdateThePopularBanner,
  handleUpdateBrandPosterBanner,
  handleUpdateProductPosterAdsBanner,
};
