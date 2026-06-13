import { Router } from "express";
import {
    createPost,
    getAllPost,
    getPostById,
    updatePost,
    deletePost
} from "../controllers/postController.js";
import verifyJWT from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/create", verifyJWT, createPost);
router.get("/", getAllPost);
router.get("/:id", getPostById);
router.patch("/:id", verifyJWT, updatePost);
router.delete("/:id", verifyJWT, deletePost);

export default router;