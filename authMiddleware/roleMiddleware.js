const clearTokenCookie = require("../authService/clearCookie");

const authorizeRoles = (roles) => {
    return (req, res, next) => {
   try {
   // Check if user exists (token should have been validated in auth middleware)
   if(!req.user){
    clearTokenCookie(res);
    return res.status(401).json({message: "Unauthorized! Please login again."});
   }
   
   if(!roles.includes(req.user.role)){
    return res.status(403).json({message: "Unauthorized Access! You are not authorized to access this resource."});
   } 
   next();
   } catch (error) {
    console.log(error);
    clearTokenCookie(res);
    return res.status(500).json({message: "Authorization failed."});
   }
    };
  };
  
  module.exports = { authorizeRoles };
  