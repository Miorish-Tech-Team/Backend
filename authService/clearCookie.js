const { serialize } = require("cookie");
const clearTokenCookie = (res) => {
  res.setHeader("Set-Cookie", [
    serialize("token", "", {
       domain:".miorish.com",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    }),
    serialize("token_middleware", "", {
       domain:".miorish.com",
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    }),
  ]);
};

module.exports = clearTokenCookie;
