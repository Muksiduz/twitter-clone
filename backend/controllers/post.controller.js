import Notification from "../model/notification.model";
import Post from "../model/post.model";
import User from "../model/user.model";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "No user Found" });

    if (!text && !img)
      return res.status(401).json({ message: "Post must have text or image" });

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();

    res.status(401).json({ message: "Successfully created a post" });
  } catch (error) {
    console.log("Error in creating post", error);
    res.status(500).json({ message: "Error in creating post" });
  }
};
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text)
      return res.status(404).json({ message: "text field is reequired" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "coulnot find post" });

    const comment = { user: userId, text };
    post.comments.push(comment);

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in getting single post", error);
    res.status(500).json({ message: "Error in getting single post" });
  }
};

export const allPosts = async (req, res) => {
  try {
    const allPost = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });

    if (!allPost) return res.status(404).json({ message: "No posts Found" });

    if (allPost.length === 0) return res.status(200).json([]);

    res.status(401).json(allPost);
  } catch (error) {
    console.log("Error in getting all post", error);
    res.status(500).json({ message: "Error in getting all post" });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  let { img } = req.body;
  const userId = req.user._id.toString();
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "No user Found" });

    const post = await Post.findById({ id });

    if (post.user.toString() !== req.user._id.toString())
      return res
        .status(401)
        .json({ error: "you are not authorized to delete the post" });

    if (img) {
      if (post.img) {
        const imageId = post.img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imageId);
      }
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    post.text = text || post.text;
    post.img = img || post.img;

    await post.save();
    res.status(401).json(post);
  } catch (error) {
    console.log("Error in updating post", error);
    res.status(500).json({ message: "Error in updating post" });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.body;
  try {
    const post = await User.findById(id);
    if (!post) return res.status(401).json({ message: "No post Found" });

    if (post.user.toString() !== req.user._id.toString())
      return res
        .status(401)
        .json({ error: "you are not authorized to delete the post" });

    if (post.img) {
      const imageId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({
      message: "successfully deleted the post",
    });
  } catch (error) {
    console.log("Error in deleting post", error);
    res.status(500).json({ message: "Error in deleting post" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "No post Found" });

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      //unlike
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({ message: "successfully unliked the post" });
    } else {
      //like
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      //notification
      const notification = new Notification({
        from: req.user._id,
        to: post.user,
        type: "like",
        read: false,
      });

      await notification.save();
      //success message
      res.status(200).json({ message: "successfully liked the post" });
    }
  } catch (error) {
    console.log("Error in deleting post", error);
    res.status(500).json({ message: "Error in deleting post" });
  }
};
export const getSuggestedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "USER NOT FOUND" });

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });

    res.status(404).json(feedPosts);
  } catch (error) {
    console.log("Error in deleting post", error);
    res.status(500).json({ message: "Error in deleting post" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getting liked post", error);
    res.status(500).json({ message: "Error in getting liked  post" });
  }
};
export const getUserPost = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const posts = await Post.find({ user: user._id })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPost post", error);
    res.status(500).json({ message: "Error in ggetUserPost  post" });
  }
};
