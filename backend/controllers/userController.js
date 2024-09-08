import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(`Error while getting user profile:${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userToFollow = await User.findById(userId);
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }
    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }
    const isFollowing =
      Array.isArray(currentUser.following) &&
      currentUser.following.includes(userId.toString());
    if (isFollowing) {
      return res
        .status(400)
        .json({ error: "You are already following this user" });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { following: userId },
      });
      await User.findByIdAndUpdate(userId, {
        $addToSet: { followers: req.user._id },
      });
      //notification
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userId,
      });
      await newNotification.save();
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log(`Error while following user:${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filerSuggestions = users.filter((user) => {
      const isFollowing =
        user.following &&
        Array.isArray(user.following) &&
        user.following.includes(userId.toString());
      return !isFollowing;
    });
    const sliceSuggestions = filerSuggestions.slice(0, 4);
    sliceSuggestions.forEach((user) => (user.password = null));
    res.status(200).json(sliceSuggestions);
  } catch (error) {
    console.log(`Error while getting suggestions:${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const {
      username,
      fullName,
      email,
      bio,
      profileImg,
      coverImg,
      currentPassword,
      newPassword,
      link,
    } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid current password" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    if (profileImg) {
      if (user.prfileImg) {
        await cloudinary.uploader.destroy(
          user.prfileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg, {
        upload_preset: "twitter",
      });
      user.profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg, {
        upload_preset: "twitter",
      });
      user.coverImg = uploadedResponse.secure_url;
    }
    user.username = username || user.username;
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.prfileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    await user.save();
    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.log(`Error while updating user profile:${error}`);
    res.status(500).json({ error: error.message });
  }
};
//followUser,
// getSuggestions,
// getUserProfile,
// unfollowUser,
// updateUserProfile,
