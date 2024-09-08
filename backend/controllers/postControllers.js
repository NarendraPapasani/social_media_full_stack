import { v2 as cloudinary } from "cloudinary";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
export const createPost = async (req, res) => {
  const { text } = req.body;
  let { img } = req.body;
  const userId = req.user._id.toString();
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (!text && !img) {
    return res.status(400).json({ error: "Text or image is required" });
  }
  if (img) {
    const uploadedResponse = await cloudinary.uploader.upload(img);
    img = uploadedResponse.secure_url;
  }
  const newPost = new Post({
    user: userId,
    text,
    img,
  });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log(`Error while creating post:${error}`);
    res.status(409).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id.toString();
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user.toString() !== userId) {
      return res.status(401).json({ error: "You can delete only your post" });
    }
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(`Error while deleting post:${error}`);
    res.status(409).json({ error: error.message });
  }
};

export const likeUnlikePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id.toString();
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    console.log(`Error while liking/unliking post:${error}`);
    res.status(409).json({ error: error.message });
  }
};

export const commentPost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id.toString();
  const { text } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();
    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.log(`Error while commenting on post:${error}`);
    res.status(409).json({ error: error.message });
  }
};
