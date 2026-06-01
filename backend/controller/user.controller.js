import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import path from "path";

/* ── GET /api/user/me ──────────────────────────────────── */
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ── PUT /api/user/profile ─────────────────────────────── */
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      username,
      phone,
      country,
      bio,
      avatar,
      twitter,
      github,
      linkedin,
    } = req.body;

    if (!name?.trim())
      return res.status(400).json({ message: "Name is required." });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name.trim(),
        username: username?.trim() || "",
        phone: phone?.trim() || "",
        country: country?.trim() || "",
        bio: bio?.trim() || "",
        // ...(avatar && { avatar }),
        "socials.twitter": twitter?.trim() || "",
        "socials.github": github?.trim() || "",
        "socials.linkedin": linkedin?.trim() || "",
      },
      { new: true, select: "-password" },
    );

    return res.status(200).json({ message: "Profile updated.", user });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ── POST /api/user/avatar ─────────────────────────────── */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded." });

    // Build public URL – adjust if you use cloud storage
    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true, select: "-password" },
    );

    return res
      .status(200)
      .json({ message: "Avatar uploaded.", avatar: avatarUrl, user });
  } catch (error) {
    console.error("uploadAvatar error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ── PUT /api/user/password ────────────────────────────── */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required." });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const user = await User.findById(req.user._id);
    if (!user.password) {
      return res
        .status(400)
        .json({ message: "OAuth accounts cannot set a password here." });
    }

    const match = await user.comparePassword(currentPassword);
    if (!match)
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });

    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("updatePassword error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ── PUT /api/user/settings ────────────────────────────── */
export const updateSettings = async (req, res) => {
  try {
    const { notifications, privacy, language, timezone } = req.body;

    const update = {};
    // if (notifications) update["settings.notifications"] = notifications;
    // if (privacy) update["settings.privacy"] = privacy;
    // if (language) update["settings.language"] = language;
    // if (timezone) update["settings.timezone"] = timezone;
// BAAD MEIN — yeh 4 lines karo
if (notifications && Object.keys(notifications).length > 0)
  update["settings.notifications"] = notifications;
if (privacy && Object.keys(privacy).length > 0)
  update["settings.privacy"] = privacy;
if (language) update["settings.language"] = language;
if (timezone) update["settings.timezone"] = timezone;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, select: "-password" },
    );

    return res.status(200).json({ message: "Settings updated.", user });
  } catch (error) {
    console.error("updateSettings error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ── GET /api/user/credits ─────────────────────────────── */
export const getCredits = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("credits plan");
    return res.status(200).json({ credits: user.credits, plan: user.plan });
  } catch (error) {
    console.error("getCredits error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
