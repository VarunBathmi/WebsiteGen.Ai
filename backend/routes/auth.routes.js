

import express from "express";
import {
  googleAuth,
  emailRegister,
  emailLogin,
  logOut,
} from "../controller/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/google", googleAuth);
authRouter.post("/register", emailRegister);
authRouter.post("/login", emailLogin);
authRouter.get("/logout", logOut);

export default authRouter;
