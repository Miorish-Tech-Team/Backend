const JWT = require("jsonwebtoken");
const { parse } = require("cookie");
const clearTokenCookie = require("../authService/clearCookie");

function  optionalAuthentication() {
  return (req, res, next) => {
    try {
      let token;

      if (req.headers.cookie) {
        const parsedCookies = parse(req.headers.cookie);
        token = parsedCookies.token;
      }
      if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        }
      }
      if (!token) {
        return next();
      }

      try {
        const userPayload = JWT.verify(token, process.env.JWT_SECRET);
        req.user = userPayload;
        next();
      } catch (jwtError) {
        // Clear expired/invalid token cookies but continue without authentication
        clearTokenCookie(res);
        console.log("Optional auth - invalid/expired token, cleared cookies");
        next();
      }
    } catch (error) {
      console.error("Auth error:", error.message);
      next();
    }
  };
}
module.exports = optionalAuthentication;