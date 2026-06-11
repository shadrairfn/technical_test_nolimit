import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModels.js"
import bcrypt from "bcrypt";
import { generateAccessAndRefreshToken } from "../utils/generateToken.js";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
        throw new apiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new apiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    if (!user) {
        throw new apiError(500, "Something went wrong");
    }

    const tokenResult = await generateAccessAndRefreshToken(user.id);
    const { accessToken, refreshToken } = tokenResult.data;

    const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
    };

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            user: userResponse,
            accessToken,
            refreshToken,
        },
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        throw new apiError(400, "All fields are required");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new apiError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new apiError(401, "Invalid password");
    }

    const data = await generateAccessAndRefreshToken(user.id);

    const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
    };

    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: {
            user: userResponse,
            accessToken: data.data.accessToken,
        },
    });
});

export {registerUser, loginUser};