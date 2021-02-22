const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('./userTokens');

// Models
const User = require('../models/User');

module.exports = async function (req, res, next) {
  // Check if Access Token
  if (req.cookies.accessToken != null) {
    try {
      // Get assoc uid from jwt
      const { userId: id } = jwt.verify(
        req.cookies.accessToken,
        process.env.JWT_ACCESS_TOKEN_SECRET
      );
      const user = await User.findOne({ _id: id });

      if (user != null) {
        // Login found user
        req.login(user, (e) => {
          if (e) throw e;
        });
      }
    } catch (error) {
      console.log(error);

      // Clear cookie
      res.cookie('accessToken', '', { maxAge: 0 });
      res.cookie('refreshToken', '', { maxAge: 0 });
    }
  }
  // Check if Refresh Token exists
  // so the Access Token can be refreshed
  else if (req.cookies.refreshToken != null) {
    try {
      // Get assoc uid from jwt
      const { userId: id, tokenVersion } = jwt.verify(
        req.cookies.refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET
      );
      const user = await User.findOne({ _id: id });

      if (tokenVersion !== user.tokenVersion) {
        throw new Error('invalid token version number');
      }

      if (user != null) {
        // Generate tokens
        await generateAccessToken(user, res);
        await generateRefreshToken(user, res);

        // Login found user
        req.login(user, (e) => {
          if (e) throw e;
        });
      }
    } catch (error) {
      console.log(error);

      // Clear cookie
      res.cookie('accessToken', '', { maxAge: 0 });
      res.cookie('refreshToken', '', { maxAge: 0 });
    }
  }

  next();
};
