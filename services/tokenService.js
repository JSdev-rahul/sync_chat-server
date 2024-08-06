import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
dotenv.config();

const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, accessTokenSecretKey, {
    expiresIn: accessTokenExpiry,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, refreshTokenSecretKey, {
    expiresIn: refreshTokenExpiry,
  });
};

const generateTokens = async (user) => {
    
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
//   user.refreshToken = refreshToken;
//   await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

export {generateAccessToken,generateTokens,generateRefreshToken}
