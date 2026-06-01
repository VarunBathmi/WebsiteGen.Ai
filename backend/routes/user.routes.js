import express from "express";
import {
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  updatePassword,
  updateSettings,
  getCredits,
} from "../controller/user.controller.js";
import isAuth from "../middlewares/isAuth.js";
import { uploadAvatar as multerUpload } from "../middlewares/upload.js";

const userRouter = express.Router();

// All routes require authentication
userRouter.use(isAuth);

userRouter.get("/me", getCurrentUser);
userRouter.put("/profile", updateProfile);
userRouter.post("/avatar", multerUpload, uploadAvatar);
userRouter.put("/password", updatePassword);
userRouter.put("/settings", updateSettings);
userRouter.get("/credits", getCredits);

export default userRouter;
