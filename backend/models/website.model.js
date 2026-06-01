import mongoose from "mongoose";

// ✅ fixed: was `conversation: { messageSchema }` which is wrong syntax
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"], // ✅ matches controller which uses "assistant"
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const websiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Untitled Website",
    },
    latestCode: {
      type: String,
      required: true,
    },
    conversation: [messageSchema], // ✅ fixed: was `{ messageSchema }` (object, not array)
    deployed: {
      type: Boolean,
      default: false,
    },
    // deployed: {
    //   type: Boolean,
    //   default: false,
    // },
    starred: {
      type: Boolean,
      default: false,
    },
    deployUrl: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

const Website = mongoose.model("Website", websiteSchema);
export default Website;
