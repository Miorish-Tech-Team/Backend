const SearchHistory = require("../../models/searchHistory/userSearchHistory");
const { Op } = require("sequelize");

const handleTrackSearch = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    if (!userId) {
     
      return next();
    }

    const searchText = req.query.query?.trim();
    if (!searchText) {
      return res.status(400).json({ success: false, message: "Search text required." });
    }

    let record = await SearchHistory.findOne({ where: { userId } });

    if (record) {
      let existingSearchTextList = record.searchTextList || [];

      if (typeof existingSearchTextList === "string") {
        try {
          existingSearchTextList = JSON.parse(existingSearchTextList);
        } catch {
          existingSearchTextList = [];
        }
      }

      if (!Array.isArray(existingSearchTextList)) existingSearchTextList = [];
      const alreadyExists = existingSearchTextList.includes(searchText);

      if (!alreadyExists) {
        existingSearchTextList.push(searchText);

        record.setDataValue("searchTextList", existingSearchTextList);
        record.changed("searchTextList", true); 
        await record.save();

        
      } 
    } else {
      await SearchHistory.create({
        userId,
        productIdList: [],
        searchTextList: [searchText],
      });
      
    }

    next();
  } catch (error) {
    console.error(" Error tracking search:", error);
    next();
  }
};

const handleTrackProductClick = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    if (!userId) {
    
      return next();
    }

    const productId = parseInt(req.params.productId || req.query.productId);
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID required." });
    }

    let record = await SearchHistory.findOne({ where: { userId } });

    if (record) {
      let existingProductIdList = record.productIdList || [];

      if (typeof existingProductIdList === "string") {
        try {
          existingProductIdList = JSON.parse(existingProductIdList);
        } catch {
          existingProductIdList = [];
        }
      }

      if (!Array.isArray(existingProductIdList)) {
        existingProductIdList = [];
      }

      const alreadyExists = existingProductIdList.some(id => Number(id) === Number(productId));

      if (!alreadyExists) {
        existingProductIdList.push(Number(productId));

        record.setDataValue("productIdList", existingProductIdList);
        record.changed("productIdList", true); 
        await record.save();

      } 
    } else {
      await SearchHistory.create({
        userId,
        productIdList: [productId],
        searchTextList: [],
      });

     
    }

    next();
  } catch (error) {
    console.error(" Error tracking product click:", error);
    next();
  }
};


const getUserSearchHistory = async (userId, limit = 10) => {
  const record = await SearchHistory.findOne({ where: { userId } });

  if (!record) {
    return { recentSearchTexts: [], recentProductIds: [] };
  }

  const allSearchTexts = Array.isArray(record.searchTextList) ? record.searchTextList : [];
  const allProductIds = Array.isArray(record.productIdList) ? record.productIdList : [];

  const recentSearchTexts = allSearchTexts.slice(-limit).reverse();
  const recentProductIds = allProductIds.slice(-limit).reverse();

  return { recentSearchTexts, recentProductIds };
};

module.exports = {
  handleTrackSearch,
  handleTrackProductClick,
  getUserSearchHistory,
};
