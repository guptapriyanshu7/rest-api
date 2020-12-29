import path from "path";
import fs from "fs";

import { validationResult } from "express-validator";

import Post from "../models/post.js";
import User from "../models/user.js";

const __dirname = path.resolve();
const clearImage = (imageUrl) => {
  const filePath = path.join(__dirname, imageUrl);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

export default {
  getPosts: async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
      const totalItems = await Post.find().countDocuments();
      const posts = await Post.find()
        .populate("creator", "name")
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
      res.status(200).json({
        message: "Fetched posts successfully.",
        posts: posts,
        totalItems: totalItems,
      });
    } catch (error) {
      next(error);
    }
  },

  createPost: async (req, res, next) => {
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        const error = new Error(
          "Validation failed, entered data is incorrect."
        );
        error.statusCode = 422;
        throw error;
      }
      if (!req.file) {
        const error = new Error("No image provided.");
        error.statusCode = 422;
        throw error;
      }
      const title = req.body.title;
      const content = req.body.content;
      const imageUrl = req.file.path.replace(/\\/g, "/");
      const creator = req.userId;
      const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: creator,
      });
      await post.save();
      const user = await User.findById(creator);
      user.posts.push(post);
      await user.save();
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
      });
    } catch (error) {
      next(error);
    }
  },
  getPost: async (req, res, next) => {
    const postId = req.params.postId;
    try {
      const post = await Post.findById(postId, (err, _) => {
        if (err) {
          const error = new Error("Could not find post.");
          error.statusCode = 404;
          next(error);
        }
      }).populate("creator", "name");
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        post: post,
      });
    } catch (error) {
      next(error);
    }
  },
  updatePost: async (req, res, next) => {
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        const error = new Error(
          "Validation failed, entered data is incorrect."
        );
        error.statusCode = 422;
        throw error;
      }
      const postId = req.params.postId;
      const title = req.body.title;
      const content = req.body.content;
      let imageUrl = req.body.image;
      if (req.file) {
        imageUrl = req.file.path.replace(/\\/g, "/");
      }
      if (!imageUrl) {
        const error = new Error("No file picked.");
        error.statusCode = 422;
        throw error;
      }
      const post = await Post.findById(postId);
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      await post.save();
      res.status(200).json({
        message: "Post updated successfully!",
        post: post,
      });
    } catch (error) {
      next(error);
    }
  },
  deletedPost: async (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.userId;
    try {
      const post = await Post.findById(postId);
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      await post.remove();
      clearImage(post.imageUrl);
      const user = await User.findById(userId);
      user.posts.pull(postId);
      await user.save();
      res.status(200).json({ message: "Deleted post." });
    } catch (error) {
      next(error);
    }
  },
};
