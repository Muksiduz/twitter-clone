import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const existingUser = await User.findOne({ username: username });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exits or select a different name",
      });
    }

    const existingEmail = await User.findOne({ email: email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email ID already exists",
      });
    }

    //hashing of password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: username,
      fullname: fullname,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        fullname: newUser.fullname,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
        bio: newUser.bio,
        link: newUser.link,
      });
    } else {
      res.status(401).json({
        message: "Invalid User Data",
      });
    }
  } catch (error) {
    console.log("Internal server error", error);
    res.status(501).json({
      success: false,
      message: "error in sigging up",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    const isCorrectPassword = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isCorrectPassword) {
      return res.status(402).json({ message: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
      link: user.link,
    });
  } catch (error) {
    console.log("Error in logging in :", error);
    res.status(500).json({
      success: false,
      message: "Could not login",
    });
  }
};

export const logout = async (req, res) => {
  try {
    await res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logging out :", error);
    res.status(500).json({
      message: "Could not logout",
    });
  }
};

export const getme = async (req, res) => {
  try {
    const user = await User.findById(res.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in get me controller :", error);
    res.status(500).json({
      message: "error in get me controller",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getting all users :", error);
    res.status(500).json({
      message: "error in getting all users",
    });
  }
};

export const getSingleUser = async (req, res) => {
  const { username } = req.params;
  try {
    const searchUser = await User.findOne({ username: username }).select(
      "-password"
    );

    if (!searchUser) return res.status(404).json({ message: "user not found" });

    res.status(200).json(searchUser);
  } catch (error) {
    console.log("Error in getting single user :", error);
    res.status(500).json({
      message: "error in getting single user",
    });
  }
};

export const updateProfile = async (req, res) => {
  const { fullname, username, email, currentpassword, newpassword, bio, link } =
    req.body;

  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
  } catch (error) {
    console.log("Error in Updating Profile user :", error);
    res.status(500).json({
      message: "error in Updating Profile user",
    });
  }
};
