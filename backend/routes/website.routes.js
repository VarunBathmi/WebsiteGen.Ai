import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  updateWebsite,
  generateWebsite,
  getAll,
  getWebsiteById,
  deleteWebsite,
  deploy,
  getBySlug,
} from "../controller/website.controller.js";

const websiteRouter = express.Router();

websiteRouter.post("/generate", isAuth, generateWebsite);
websiteRouter.post("/update/:id", isAuth, updateWebsite);
websiteRouter.get("/get-by-id/:id", isAuth, getWebsiteById);
websiteRouter.get("/get-all", isAuth, getAll);
websiteRouter.delete("/delete/:id", isAuth, deleteWebsite);
websiteRouter.post("/deploy/:id", isAuth, deploy);
websiteRouter.get("/get-by-slug/:slug", getBySlug);

websiteRouter.patch("/star/:id", isAuth, async (req, res) => {
  try {
    const Website = (await import("../models/website.model.js")).default;
    const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
    if (!website) return res.status(404).json({ message: "Not found" });
    website.starred = !website.starred;
    await website.save();
    res.json({ starred: website.starred });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// websiteRouter.get("/add-credits", isAuth, async (req, res) => {
//   const User = (await import("../models/user.model.js")).default;
//   const user = await User.findById(req.user._id);
//   user.credits = 500;
//   await user.save();
//   return res.json({ message: "credits added", credits: user.credits });
// });

export default websiteRouter;
