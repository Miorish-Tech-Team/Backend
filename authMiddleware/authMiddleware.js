const JWT = require("jsonwebtoken");
const { parse } = require("cookie");
const clearTokenCookie = require("../authService/clearCookie");


function checkForAuthenticationCookie() {
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
        return res.status(401).json({ error: "No token found. Please login." });
      }

      // Validate token and handle expiration
      try {
        const userPayload = JWT.verify(token, process.env.JWT_SECRET);
        req.user = userPayload;
        next();
      } catch (jwtError) {
        // Clear cookies on any token error (expired, invalid, malformed)
        clearTokenCookie(res);
        
        if (jwtError.name === "TokenExpiredError") {
          return res.status(401).json({ 
            error: "Token expired. Please login again.",
            expired: true 
          });
        } else if (jwtError.name === "JsonWebTokenError") {
          return res.status(401).json({ 
            error: "Invalid token. Please login again.",
            invalid: true 
          });
        } else {
          return res.status(401).json({ 
            error: "Authentication failed. Please login again." 
          });
        }
      }
    } catch (error) {
      console.error("Auth error:", error.message);
      clearTokenCookie(res);
      return res.status(500).json({ error: "Authentication failed." });
    }
  };
}

module.exports = checkForAuthenticationCookie;
