import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Post from "../models/postModels.js";

const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body || {};

    console.log("req", req.body);
    console.log("content", content);


    if (!content) {
        throw new apiError(400, "All fields are required");
    }

    const author = req.user.id;

    const post = await Post.create({
        content: content,
        userId: author,
    });

    return res.status(201).json({ post });
});

const getAllPost = asyncHandler(async (req, res) => {
    const posts = await Post.findAll({});
    return res.status(200).json({ posts });
});

const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw new apiError(400, "All fields are required");
    const post = await Post.findOne({ where: { id: id } });
    return res.status(200).json({ post });
});

const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;
    if (!id || !content) throw new apiError(400, "All fields are required");

    const authorId = await Post.findOne({
        where: {
            id: id,
            userId: user.id,
        },
    });

    if (authorId == null) throw new apiError(400, "You are not authorized to update this post");

    await Post.update({
        content: content,
    }, { where: { id: id } });

    return res.status(200).json({
        content: content,
        id: id
    });
})

const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    if (!id) throw new apiError(400, "All fields are required");

    const authorId = await Post.findOne({
        where: {
            id: id,
            userId: user.id,
        },
    });

    if (authorId == null) throw new apiError(400, "You are not authorized to delete this post");

    await Post.destroy({ where: { id: id } });

    return res.status(200).json({
        message: "Post deleted successfully",
        id: id
    });
})

export { createPost, getAllPost, getPostById, updatePost, deletePost }