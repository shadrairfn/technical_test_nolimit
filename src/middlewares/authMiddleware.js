import jwt from "jsonwebtoken";
import User from "../models/userModels.js";
import { apiError } from "../utils/apiError.js";

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
    if (!authHeader?.startsWith("Bearer ")) {
      throw new apiError(401, "Authorization token required");
    }
  
    const token = authHeader.split(" ")[1]; 
  
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded; 
      next();
  } catch (err) {
    console.error("JWT Error:", err.message);

    if (err.message === "jwt expired") {
      const decoded = jwt.decode(token);
      const userId = decoded?.id;
      
      const user = await User.findOne({
        where: { id: userId },
        attributes: { exclude: ['password'] }
      })
      if (user) {
        try {
          const decodedRefresh = jwt.verify(user.dataValues.refreshToken, process.env.REFRESH_TOKEN_SECRET);

          if (decodedRefresh.id === userId) {
            const user = await User.findByPk(userId);

            if (user) {
              const newAccessToken = jwt.sign(
                { id: userId },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1m" }
              );

              return res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                accessToken: newAccessToken
              })
            }
          }
        } catch (refreshErr) {
          console.error("Auto Refresh Error:", refreshErr.message);
        }
      }
    }

    return res.status(401).json({ message: "Unauthorized: Token verification failed" });
  }
};

export default verifyJWT;
