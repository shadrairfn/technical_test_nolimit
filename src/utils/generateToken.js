import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

const generateAccessAndRefreshToken = async (userId) => {
  const payload = { id: userId };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });

  await User.update(
    { refreshToken, accessToken },
    { where: { id: userId } }
  );

  return { 
    message: "Tokens generated successfully",
    data: { accessToken, refreshToken },
    success: true
  };
};

export { generateAccessAndRefreshToken };
