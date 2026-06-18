import generateResponse from "../config/openRouter.js";
import User from "../models/user.model.js";
import Website from "../models/website.model.js";
import extractJson from "../utils/extractJson.js";
import mongoose from "mongoose";

// Shorter prompt = more tokens left for HTML output
const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS, AND JAVASCRIPT
THAT WORK PERFECTLY ON ALL SCREEN SIZES.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO FRAMEWORKS
❌ NO LIBRARIES
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPONSIVE LAYOUTS

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
--------------------------------------------------
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

--------------------------------------------------
RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
--------------------------------------------------
THIS WEBSITE MUST BE FULLY RESPONSIVE.

YOU MUST IMPLEMENT:

✔ Mobile-first CSS approach
✔ Responsive layout for:
  - Mobile (<768px)
  - Tablet (768px–1024px)
  - Desktop (>1024px)

✔ Use:
  - CSS Grid / Flexbox
  - Relative units (%, rem, vw)
  - Media queries

✔ REQUIRED RESPONSIVE BEHAVIOR:
  - Navbar collapses / stacks on mobile
  - Sections stack vertically on mobile
  - Multi-column layouts become single-column on small screens
  - Images scale proportionally
  - Text remains readable on all devices
  - No horizontal scrolling on mobile
  - Touch-friendly buttons on mobile

IF THE WEBSITE IS NOT RESPONSIVE → RESPONSE IS INVALID.

--------------------------------------------------
IMAGES (MANDATORY & RESPONSIVE)
--------------------------------------------------
- Use high-quality images ONLY from:
  https://images.unsplash.com/
- EVERY image URL MUST include:
  ?auto=format&fit=crop&w=1200&q=80

- Images must:
  - Be responsive (max-width: 100%)
  - Resize correctly on mobile
  - Never overflow containers

--------------------------------------------------
TECHNICAL RULES (VERY IMPORTANT)
--------------------------------------------------
- Output ONE single HTML file
- Exactly ONE <style> tag
- Exactly ONE <script> tag
- NO external CSS / JS / fonts
- Use system fonts only
- iframe srcdoc compatible
- SPA-style navigation using JavaScript
- No page reloads
- No dead UI
- No broken buttons
--------------------------------------------------
SPA VISIBILITY RULE (MANDATORY)
--------------------------------------------------
- Pages MUST NOT be hidden permanently
- If .page { display: none } is used,
  then .page.active { display: block } is REQUIRED
- At least ONE page MUST be visible on initial load
- Hiding all content is INVALID


--------------------------------------------------
REQUIRED SPA PAGES
--------------------------------------------------
- Home
- About
- Services / Features
- Contact

--------------------------------------------------
FUNCTIONAL REQUIREMENTS
--------------------------------------------------
- Navigation must switch pages using JS
- Active nav state must update
- Forms must have JS validation
- Buttons must show hover + active states
- Smooth section/page transitions

--------------------------------------------------
FINAL SELF-CHECK (MANDATORY)
--------------------------------------------------
BEFORE RESPONDING, ENSURE:

1. Layout works on mobile, tablet, desktop
2. No horizontal scroll on mobile
3. All images are responsive
4. All sections adapt properly
5. Media queries are present and used
6. Navigation works on all screen sizes
7. At least ONE page is visible without user interaction

IF ANY CHECK FAILS → RESPONSE IS INVALID

--------------------------------------------------
OUTPUT FORMAT (RAW JSON ONLY)
--------------------------------------------------
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
- RETURN RAW JSON ONLY
- NO markdown
- NO explanations
- NO extra text
- FORMAT MUST MATCH EXACTLY
- IF FORMAT IS BROKEN → RESPONSE IS INVALID
`;

export const generateWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt)
      return res.status(400).json({ message: "Prompt is required." });
    if (typeof prompt !== "string")
      return res.status(400).json({ message: "Prompt must be a string." });
    if (prompt.length > 5000)
      return res
        .status(400)
        .json({ message: "Prompt is too long (max 5000 chars)." });

    // Deduct credits atomically to prevent race condition exploits
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, credits: { $gte: 50 } },
      { $inc: { credits: -50 } },
      { new: true },
    );

    if (!user) {
      const existingUser = await User.findById(req.user._id);
      if (!existingUser)
        return res.status(404).json({ message: "User not found." });
      return res
        .status(400)
        .json({ message: "Not enough credits to generate a website." });
    }

    const finalPrompt = masterPrompt.replace("{USER_PROMPT}", prompt);

    let parsed = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (!parsed && attempts < MAX_ATTEMPTS) {
      attempts++;
      console.log(`🔄 Generation attempt ${attempts}/${MAX_ATTEMPTS}`);
      try {
        const raw = await generateResponse(finalPrompt);
        parsed = await extractJson(raw);
        if (!parsed?.code) {
          console.warn(
            `⚠️  Attempt ${attempts}: no code in response, retrying...`,
          );
          parsed = null;
        }
      } catch (err) {
        console.error(`❌ Attempt ${attempts} failed:`, err.message);
        if (attempts >= MAX_ATTEMPTS) throw err;
      }
    }

    if (!parsed?.code) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 50 } });
      return res.status(500).json({
        message: "AI returned invalid response. Please try again.",
      });
    }

    const slug =
      prompt
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .slice(0, 50) +
      "-" +
      Date.now();

    const website = await Website.create({
      user: user._id,
      title: prompt.slice(0, 60),
      slug,
      latestCode: parsed.code,
      conversation: [
        { role: "user", content: prompt },
        {
          role: "assistant",
          content: parsed.message || "Website generated successfully.",
        },
      ],
    });

    return res.status(201).json({
      success: true,
      websiteId: website._id,
      remainingCredits: user.credits,
    });
  } catch (error) {
    console.error("generateWebsite error:", error);
    await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 50 } });
    return res
      .status(500)
      .json({ message: `Generate website error: ${error.message}` });
  }
};

// ─── Get Website By ID ───────────────────────────────────────────────────────
export const getWebsiteById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid website ID." });
    }

    const website = await Website.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!website)
      return res.status(404).json({ message: "Website not found." });

    return res.status(200).json(website);
  } catch (error) {
    console.error("getWebsiteById error:", error);
    return res
      .status(500)
      .json({ message: `Get website error: ${error.message}` });
  }
};

// ─── Update Website ──────────────────────────────────────────────────────────
export const updateWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt)
      return res.status(400).json({ message: "Prompt is required." });
    if (typeof prompt !== "string")
      return res.status(400).json({ message: "Prompt must be a string." });
    if (prompt.length > 5000)
      return res
        .status(400)
        .json({ message: "Prompt is too long (max 5000 chars)." });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid website ID." });
    }

    const website = await Website.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!website)
      return res.status(404).json({ message: "Website not found." });

    // Deduct credits atomically
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, credits: { $gte: 25 } },
      { $inc: { credits: -25 } },
      { new: true },
    );

    if (!user) {
      const existingUser = await User.findById(req.user._id);
      if (!existingUser)
        return res.status(404).json({ message: "User not found." });
      return res
        .status(400)
        .json({ message: "Not enough credits to update website." });
    }

    const updatePrompt = `Update this HTML website based on the user request.

CURRENT CODE:
${website.latestCode}

USER REQUEST: ${prompt}

Return ONLY this raw JSON (no markdown, no backticks):
{"message":"one sentence confirmation","code":"<COMPLETE UPDATED HTML FILE>"}

IMPORTANT: Return the COMPLETE HTML. Do NOT truncate.`;

    let parsed = null;
    let attempts = 0;

    while (!parsed && attempts < 3) {
      attempts++;
      try {
        const raw = await generateResponse(updatePrompt);
        parsed = await extractJson(raw);
        if (!parsed?.code) parsed = null;
      } catch (err) {
        console.error(`Update attempt ${attempts} failed:`, err.message);
        if (attempts >= 3) throw err;
      }
    }

    if (!parsed?.code) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 25 } });
      return res
        .status(500)
        .json({ message: "AI returned invalid response. Please try again." });
    }

    website.conversation.push(
      { role: "user", content: prompt },
      { role: "assistant", content: parsed.message || "Changes applied." },
    );

    // ✅ ADD KARO:
    if (parsed.code.length > 500000) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 25 } });
      return res.status(400).json({ message: "Generated code too large." });
    }

    website.latestCode = parsed.code;
    await website.save();

    return res.status(200).json({
      message: parsed.message,
      code: parsed.code,
      remainingCredits: user.credits,
    });
  } catch (error) {
    console.error("updateWebsite error:", error);
    await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 25 } });
    return res
      .status(500)
      .json({ message: `Update website error: ${error.message}` });
  }
};

// ─── Get All Websites ────────────────────────────────────────────────────────
export const getAll = async (req, res) => {
  try {
    const websites = await Website.find({ user: req.user._id }).sort({
      updatedAt: -1,
    });

    return res.status(200).json(websites);
  } catch (error) {
    console.error("getAll error:", error);
    return res
      .status(500)
      .json({ message: `Get all websites error: ${error.message}` });
  }
};

// ─── Delete Website ──────────────────────────────────────────────────────────
export const deleteWebsite = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid website ID." });
    }

    const website = await Website.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website)
      return res.status(404).json({ message: "Website not found." });

    return res.status(200).json({ message: "Website deleted successfully." });
  } catch (error) {
    console.error("deleteWebsite error:", error);
    return res
      .status(500)
      .json({ message: `Delete website error: ${error.message}` });
  }
};

// ─── Deploy Website ──────────────────────────────────────────────────────────
export const deploy = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid website ID." });
    }

    const website = await Website.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website)
      return res.status(404).json({ message: "Website not found." });

    // Generate slug if somehow missing
    if (!website.slug) {
      website.slug =
        website.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .slice(0, 60) +
        "-" +
        website._id.toString().slice(-5);
    }

    website.deployed = true;
    website.deployUrl = `${process.env.CLIENT_URL}/site/${website.slug}`;

    await website.save();

    return res.status(200).json({ url: website.deployUrl });
  } catch (error) {
    console.error("deploy error:", error);
    return res
      .status(500)
      .json({ message: `Deploy website error: ${error.message}` });
  }
};

// ─── Get Website By Slug (public) ────────────────────────────────────────────
export const getBySlug = async (req, res) => {
  try {
    const website = await Website.findOne({
      slug: req.params.slug,
      deployed: true,
    });

    if (!website)
      return res.status(404).json({ message: "Website not found." });

    return res.status(200).json(website);
  } catch (error) {
    console.error("getBySlug error:", error);
    return res
      .status(500)
      .json({ message: `Get by slug error: ${error.message}` });
  }
};

// // ─── Generate Website ────────────────────────────────────────────────────────
// export const generateWebsite = async (req, res) => {
//   try {
//     const { prompt } = req.body;

//     if (!prompt) return res.status(400).json({ message: "Prompt is required." });
//     if (typeof prompt !== "string") return res.status(400).json({ message: "Prompt must be a string." });
//     if (prompt.length > 5000) return res.status(400).json({ message: "Prompt is too long (max 5000 chars)." });

//     // Deduct credits atomically to prevent race condition exploits
//     const user = await User.findOneAndUpdate(
//       { _id: req.user._id, credits: { $gte: 50 } },
//       { $inc: { credits: -50 } },
//       { new: true }
//     );

//     if (!user) {
//       // Check if user exists but has no credits
//       const existingUser = await User.findById(req.user._id);
//       if (!existingUser) return res.status(404).json({ message: "User not found." });
//       return res.status(400).json({ message: "Not enough credits to generate a website." });
//     }

//     const finalPrompt = masterPrompt.replace("{USER_PROMPT}", prompt);

//     let parsed = null;
//     let attempts = 0;
//     const MAX_ATTEMPTS = 3;

//     while (!parsed && attempts < MAX_ATTEMPTS) {
//       attempts++;
//       console.log(`🔄 Generation attempt ${attempts}/${MAX_ATTEMPTS}`);
//       try {
//         const raw = await generateResponse(finalPrompt);
//         parsed = await extractJson(raw);
//         if (!parsed?.code) {
//           console.warn(
//             `⚠️  Attempt ${attempts}: no code in response, retrying...`,
//           );
//           parsed = null;
//         }
//       } catch (err) {
//         console.error(`❌ Attempt ${attempts} failed:`, err.message);
//         if (attempts >= MAX_ATTEMPTS) throw err;
//       }
//     }

//     if (!parsed?.code) {
//       // Refund credits since generation failed
//       await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 50 } });
//       return res.status(500).json({
//         message: "AI returned invalid response. Please try again.",
//       });
//     }

//     const slug =
//       prompt
//         .toLowerCase()
//         .replace(/\s+/g, "-")
//         .replace(/[^\w-]+/g, "")
//         .slice(0, 50) +
//       "-" +
//       Date.now();

//     const website = await Website.create({
//       user: user._id,
//       title: prompt.slice(0, 60),
//       slug,
//       latestCode: parsed.code,
//       conversation: [
//         { role: "user", content: prompt },
//         {
//           role: "assistant",
//           content: parsed.message || "Website generated successfully.",
//         },
//       ],
//     });

//     return res.status(201).json({
//       success: true,
//       websiteId: website._id,
//       remainingCredits: user.credits,
//     });
//   } catch (error) {
//     console.error("generateWebsite error:", error);
//     // Refund on catastrophic error
//     await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 50 } });
//     return res
//       .status(500)
//       .json({ message: `Generate website error: ${error.message}` });
//   }
// };

// // ─── Get Website By ID ───────────────────────────────────────────────────────
// export const getWebsiteById = async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ message: "Invalid website ID." });
//     }

//     const website = await Website.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });
//     if (!website)
//       return res.status(404).json({ message: "Website not found." });

//     return res.status(200).json(website);
//   } catch (error) {
//     console.error("getWebsiteById error:", error);
//     return res
//       .status(500)
//       .json({ message: `Get website error: ${error.message}` });
//   }
// };

// // ─── Update Website ──────────────────────────────────────────────────────────
// export const updateWebsite = async (req, res) => {
//   try {
//     const { prompt } = req.body;
//     if (!prompt) return res.status(400).json({ message: "Prompt is required." });
//     if (typeof prompt !== "string") return res.status(400).json({ message: "Prompt must be a string." });
//     if (prompt.length > 5000) return res.status(400).json({ message: "Prompt is too long (max 5000 chars)." });

//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ message: "Invalid website ID." });
//     }

//     const website = await Website.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });
//     if (!website)
//       return res.status(404).json({ message: "Website not found." });

//     // Deduct credits atomically
//     const user = await User.findOneAndUpdate(
//       { _id: req.user._id, credits: { $gte: 25 } },
//       { $inc: { credits: -25 } },
//       { new: true }
//     );

//     if (!user) {
//       const existingUser = await User.findById(req.user._id);
//       if (!existingUser) return res.status(404).json({ message: "User not found." });
//       return res.status(400).json({ message: "Not enough credits to update website." });
//     }

//     const updatePrompt = `Update this HTML website based on the user request.

// CURRENT CODE:
// ${website.latestCode}

// USER REQUEST: ${prompt}

// Return ONLY this raw JSON (no markdown, no backticks):
// {"message":"one sentence confirmation","code":"<COMPLETE UPDATED HTML FILE>"}

// IMPORTANT: Return the COMPLETE HTML. Do NOT truncate.`;

//     let parsed = null;
//     let attempts = 0;

//     while (!parsed && attempts < 3) {
//       attempts++;
//       try {
//         const raw = await generateResponse(updatePrompt);
//         parsed = await extractJson(raw);
//         if (!parsed?.code) parsed = null;
//       } catch (err) {
//         console.error(`Update attempt ${attempts} failed:`, err.message);
//         if (attempts >= 3) throw err;
//       }
//     }

//     if (!parsed?.code) {
//       await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 25 } });
//       return res
//         .status(500)
//         .json({ message: "AI returned invalid response. Please try again." });
//     }

//     website.conversation.push(
//       { role: "user", content: prompt },
//       { role: "assistant", content: parsed.message || "Changes applied." },
//     );
//     website.latestCode = parsed.code;
//     await website.save();

//     return res.status(200).json({
//       message: parsed.message,
//       code: parsed.code,
//       remainingCredits: user.credits,
//     });
//   } catch (error) {
//     console.error("updateWebsite error:", error);
//     await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 25 } });
//     return res
//       .status(500)
//       .json({ message: `Update website error: ${error.message}` });
//   }
// };

// // ─── Get All Websites ────────────────────────────────────────────────────────
// export const getAll = async (req, res) => {
//   try {
//     const websites = await Website.find({ user: req.user._id }).sort({
//       updatedAt: -1,
//     });
//     return res.status(200).json(websites);
//   } catch (error) {
//     console.error("getAll error:", error);
//     return res
//       .status(500)
//       .json({ message: `Get all websites error: ${error.message}` });
//   }
// };

// // ─── Delete Website ──────────────────────────────────────────────────────────
// export const deleteWebsite = async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ message: "Invalid website ID." });
//     }

//     const website = await Website.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!website) {
//       return res.status(404).json({ message: "Website not found." });
//     }

//     return res.status(200).json({ message: "Website deleted successfully." });
//   } catch (error) {
//     console.error("deleteWebsite error:", error);
//     return res
//       .status(500)
//       .json({ message: `Delete website error: ${error.message}` });
//   }
// };
