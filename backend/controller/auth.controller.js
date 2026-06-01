import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ─── helpers ────────────────────────────────────────────────────────────────

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const setCookie = (res, token) =>
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  credits: user.credits,
  plan: user.plan,
});

// ─── Google OAuth ────────────────────────────────────────────────────────────

export const googleAuth = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, avatar });
    } else {
      // Keep avatar in sync if it changed
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    const token = generateToken(user._id);
    setCookie(res, token);

    return res.status(200).json(safeUser(user));
  } catch (error) {
    console.error("googleAuth error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─── Email Register ──────────────────────────────────────────────────────────

export const emailRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);
    setCookie(res, token);

    return res.status(201).json(safeUser(user));
  } catch (error) {
    console.error("emailRegister error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─── Email Login ─────────────────────────────────────────────────────────────

export const emailLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Account was created via Google (no password set)
    if (!user.password) {
      return res.status(401).json({
        message:
          "This account uses Google sign-in. Please continue with Google.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    setCookie(res, token);

    return res.status(200).json(safeUser(user));
  } catch (error) {
    console.error("emailLogin error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logOut = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.status(200).json({ message: "Logged out successfully." });
};
