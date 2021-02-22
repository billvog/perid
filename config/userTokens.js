const jwt = require('jsonwebtoken');

// Generate user access & refresh tokens
module.exports = {
  generateAccessToken: async (user, res) => {
    try {
      // Create new access token
      const accessToken = await jwt.sign(
        {
          userId: user.id,
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {
          expiresIn: '7m',
        }
      );

      // Store access token in cookie
      res.cookie('accessToken', accessToken, {
        maxAge: 420000,
        httpOnly: true,
      });
    } catch (error) {
      console.log(error);
    }
  },
  generateRefreshToken: async (user, res) => {
    try {
      // Update user token version
      user.tokenVersion++;
      await user.save();

      // Create new refresh token
      const refreshToken = await jwt.sign(
        {
          userId: user.id,
          tokenVersion: user.tokenVersion,
        },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {
          expiresIn: '7d',
        }
      );

      // Store refresh token in cookie
      res.cookie('refreshToken', refreshToken, {
        maxAge: 604800000,
        httpOnly: true,
      });
    } catch (error) {
      console.log(error);
    }
  },
};
