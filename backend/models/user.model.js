import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, default: null },
    username: { type: String, default: "" },
    phone: { type: String, default: "" },
    country: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    socials: {
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    credits: { type: Number, default: 100, min: 0 },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        security: { type: Boolean, default: true },
        credits: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: false },
      },
      privacy: {
        publicProfile: { type: Boolean, default: false },
        analyticsOpt: { type: Boolean, default: true },
      },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
