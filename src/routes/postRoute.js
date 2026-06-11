import { Router } from "express";
import {
    createPost,
    getAllPost,
    updatePost,
    deletePost
} from "../controllers/postController.js";
import verifyJWT from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/create", verifyJWT, createPost);
router.get("/", verifyJWT, getAllPost);
router.patch("/:id", verifyJWT, updatePost);
router.delete("/:id", verifyJWT, deletePost);

export default router;