import User from "../model/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import Notification from "../model/notification.model.js";

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
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      (!newpassword && currentpassword) ||
      (!currentpassword && newpassword)
    ) {
      return res
        .status(400)
        .json({ message: "Please provide current password and new password" });
    }

    if (currentpassword && newpassword) {
      const isMatch = await bcrypt.compare(currentpassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current Password is not valid" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newpassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user.link = link || user.link;

    user = await user.save();

    user.password = null;
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in Updating Profile user :", error);
    res.status(500).json({
      message: "error in Updating Profile user",
    });
  }
};

export const followUnfollowUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userToFollow = await findById({ id });
    const currentUser = req.user._id.toString();

    if (!userToFollow || !currentUser)
      return res.status(404).json({ message: "No user Found" });

    if (id === req.user._id)
      return res.status(401).json({ message: "Can not follow your own self" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //already follow kori thoise ai karone unfollow kora
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(400).json({ message: "User unfollowe succefully" });
    } else {
      //follow kora nai ai karone follow kora
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      //send notification
      const newNotification = await Notification({
        type: "follow",
        from: req.user._id,
        to: id,
        read: false,
      });

      await newNotification.save();

      res.status(200).json({ message: "User followed succefully" });
    }
  } catch (error) {
    console.log("Error in follow Profile user :", error);
    res.status(500).json({
      message: "error in follow Profile user",
    });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 5);
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getting suggested user :", error);
    res.status(500).json({
      message: "Error in getting suggested user",
    });
  }
};
