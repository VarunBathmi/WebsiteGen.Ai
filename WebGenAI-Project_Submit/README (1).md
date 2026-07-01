<div align="center">

# 🌐 WebGenAI

### AI-Powered Website Generator

**Describe your website in plain English → Get a complete, responsive, production-ready website in seconds.**

Built with MERN Stack · Powered by DeepSeek AI via OpenRouter

</div>

---

## 📖 Table of Contents

1. [What is WebGenAI?](#-what-is-webgenai)
2. [Features](#-features)
3. [How It Works](#-how-it-works)
4. [Tech Stack](#-tech-stack)
5. [Project Structure](#-project-structure)
6. [Prerequisites — Install These First](#-prerequisites--install-these-first)
7. [External Accounts You Need to Create](#-external-accounts-you-need-to-create)
8. [Backend Setup — Detailed Steps](#-backend-setup--detailed-steps)
9. [Frontend Setup — Detailed Steps](#-frontend-setup--detailed-steps)
10. [Running the App Locally](#-running-the-app-locally)
11. [Production Deployment](#-production-deployment)
12. [API Endpoints Reference](#-api-endpoints-reference)
13. [Common Issues & Fixes](#-common-issues--fixes)
14. [Dependencies Overview](#-dependencies-overview)

---

## 🤔 What is WebGenAI?

**WebGenAI** is a full-stack web application that lets anyone — even people with zero coding knowledge — generate a complete, professional website using just a text description.

For example, a user can type:

> *"Create a modern landing page for a fitness gym called PowerZone with a dark theme, hero section, pricing plans, and a contact form"*

...and WebGenAI will generate a fully working, responsive HTML website with real CSS styling, animations, a navigation bar, images from Unsplash, and working JavaScript — all in a single click.

After generation, users can:
- **Edit the code** directly in a built-in Monaco code editor (the same editor used in VS Code)
- **Modify the website with AI** by typing follow-up instructions like *"change the color scheme to blue"* or *"add a testimonials section"*
- **Preview** their website live in real-time inside the browser
- **Publish** the website with a unique public URL (slug) that anyone can visit
- **Star** their favorite websites for quick access
- **Manage** all their generated websites from a personal dashboard

Each user gets **100 free credits** on signup. Every AI generation costs credits, creating a usage management system.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Website Generation | Type a prompt → Get a full responsive HTML/CSS/JS website |
| ✏️ Live Code Editor | Edit generated code with Monaco Editor (VS Code-style) |
| 🔄 AI-Powered Editing | Ask AI to modify your website with follow-up prompts |
| 👁️ Live Preview | See your website render instantly in an iframe preview |
| 🌐 Public Publishing | Deploy with a unique public URL (`/site/your-slug`) |
| ⭐ Star Websites | Bookmark your favorite generated sites |
| 🔐 Auth System | Email/password signup + Google OAuth login |
| 🌙 Dark / Light Mode | Full theme switching across the entire app |
| 👤 Profile Management | Update avatar (Cloudinary upload), bio, social links |
| 💳 Credit System | 100 free credits per user, tracked per generation |
| 📊 Dashboard | View, search, filter, and manage all your websites |
| 📱 Fully Responsive | Works on mobile, tablet, and desktop |

---

## ⚙️ How It Works

```
User types a prompt
        ↓
Frontend sends prompt to Backend API (/api/website/generate)
        ↓
Backend verifies user is logged in + has enough credits
        ↓
Backend sends prompt to DeepSeek AI via OpenRouter API
        ↓
AI returns a JSON object containing { title, html }
        ↓
Backend runs JSON repair utility (in case AI response is malformed)
        ↓
Backend deducts credits from user atomically in MongoDB
        ↓
Generated website is saved to MongoDB with a unique slug
        ↓
Frontend receives the HTML and displays it in Monaco Editor + iframe preview
        ↓
User can edit, preview, publish, or ask AI to modify further
```

---

## 🧱 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 19 + Vite | Fast SPA with lazy loading |
| Styling | Tailwind CSS v4 | Utility-first responsive design |
| State Management | Redux Toolkit | Global user/auth state |
| Routing | React Router v7 | Client-side page navigation |
| Code Editor | Monaco Editor | VS Code-style in-browser editor |
| Backend | Node.js + Express 5 | REST API server |
| Database | MongoDB + Mongoose | Stores users and websites |
| AI | DeepSeek Chat via OpenRouter | Website generation |
| Auth | JWT (cookies) + Firebase Google OAuth | Secure authentication |
| Media | Cloudinary + Multer | Avatar image uploads |
| Animations | Framer Motion | Smooth UI transitions |
| Deployment | Vercel (frontend) + Render (backend) | Free hosting |

---

## 📁 Project Structure

```
WebGenAI/
│
├── frontend/                        ← React + Vite application
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── logo-horizontal.svg
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx             ← Landing page (public)
│   │   │   ├── Dashboard.jsx        ← View all user websites
│   │   │   ├── Generate.jsx         ← AI website generation page
│   │   │   ├── WebsiteEditor.jsx    ← Monaco editor + live preview
│   │   │   ├── ProfilePage.jsx      ← Public/private profile view
│   │   │   ├── EditProfile.jsx      ← Edit name, avatar, bio, socials
│   │   │   ├── Settings.jsx         ← Notification & privacy settings
│   │   │   └── LiveSite.jsx         ← Public website viewer (/site/:slug)
│   │   │
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          ← App navigation sidebar
│   │   │   ├── LoginModal.jsx       ← Login popup
│   │   │   ├── Signupmodal.jsx      ← Signup popup
│   │   │   ├── ProfileDropdown.jsx  ← User avatar dropdown menu
│   │   │   ├── CreditUsageBar.jsx   ← Credit balance indicator
│   │   │   ├── InputField.jsx       ← Reusable form input
│   │   │   └── ThemeToggle.jsx      ← Dark/light mode switch
│   │   │
│   │   ├── context/
│   │   │   └── ThemeContext.jsx     ← Global dark/light theme state
│   │   │
│   │   ├── redux/
│   │   │   ├── store.js             ← Redux store setup
│   │   │   └── userSlice.js         ← User auth state slice
│   │   │
│   │   ├── hooks/
│   │   │   └── useGetCurrentUser.jsx← Fetch logged-in user on app load
│   │   │
│   │   ├── firebase.js              ← Firebase Google Auth setup
│   │   ├── App.jsx                  ← Routes + ProtectedRoute wrapper
│   │   ├── App.css
│   │   ├── index.css                ← Global CSS + CSS custom properties
│   │   └── main.jsx                 ← React app entry point
│   │
│   ├── .envExample                  ← Frontend env variable template
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/                         ← Express REST API server
    ├── controller/
    │   ├── auth.controller.js       ← Signup, login, Google auth, logout
    │   ├── user.controller.js       ← Get me, update profile, change password
    │   └── website.controller.js    ← Generate, edit, publish, delete websites
    │
    ├── routes/
    │   ├── auth.routes.js           ← /api/auth/*
    │   ├── user.routes.js           ← /api/user/*
    │   └── website.routes.js        ← /api/website/*
    │
    ├── models/
    │   ├── user.model.js            ← User schema (credits, plan, settings, socials)
    │   └── website.model.js         ← Website schema (HTML, slug, conversation history)
    │
    ├── middlewares/
    │   ├── isAuth.js                ← JWT cookie verification middleware
    │   └── upload.js                ← Multer + Cloudinary upload middleware
    │
    ├── config/
    │   ├── db.js                    ← MongoDB connection
    │   ├── cloudinary.js            ← Cloudinary SDK config
    │   └── openRouter.js            ← DeepSeek AI API call function
    │
    ├── utils/
    │   └── extractJson.js           ← Repairs malformed AI JSON responses
    │
    ├── .envExample                  ← Backend env variable template
    ├── index.js                     ← Express server entry point
    └── package.json
```

---

## ✅ Prerequisites — Install These First

Before setting up the project, make sure your computer has the following installed. Check by running each command in your terminal:

### 1. Node.js (v18 or higher)

```bash
node --version
# Should print: v18.x.x or higher
```

If not installed → Download from **https://nodejs.org/** (choose the LTS version)

### 2. npm (comes with Node.js)

```bash
npm --version
# Should print: 9.x.x or higher
```

### 3. Git

```bash
git --version
# Should print: git version 2.x.x
```

If not installed → Download from **https://git-scm.com/**

### 4. A Code Editor (Recommended)

Download **VS Code** from **https://code.visualstudio.com/** — it's free and the best option for this project.

---

## 🔑 External Accounts You Need to Create

WebGenAI relies on 4 external services. You must create accounts and get credentials for each one before running the app. All of them have **free tiers**.

---

### 1. MongoDB Atlas (Database)

MongoDB Atlas hosts your database in the cloud for free.

**Steps:**

1. Go to **https://www.mongodb.com/atlas** and click **"Try Free"**
2. Sign up with Google or email
3. Choose the **Free (M0)** cluster → Select any cloud provider → Click **Create**
4. On the **"Security Quickstart"** screen:
   - Choose **"Username and Password"**
   - Create a username and password (save these!)
   - Click **"Create User"**
5. Under **"Where would you like to connect from?"**
   - Choose **"My Local Environment"**
   - Click **"Add My Current IP Address"**
   - Also add `0.0.0.0/0` to allow access from anywhere (important for Render deployment)
   - Click **"Finish and Close"**
6. In the left sidebar, click **"Database"** → Click **"Connect"** on your cluster
7. Choose **"Drivers"** → Select **Node.js**
8. Copy the connection string. It looks like:
   ```
   mongodb+srv://yourusername:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
9. Replace `<password>` with your actual password and add a database name:
   ```
   mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/webgenai?retryWrites=true&w=majority
   ```
   This is your `MONGO_URI`.

---

### 2. Cloudinary (Image Upload for Avatars)

Cloudinary stores user profile pictures for free.

**Steps:**

1. Go to **https://cloudinary.com/** and click **"Sign Up For Free"**
2. Fill in your details and verify your email
3. After logging in, you'll be on the **Dashboard**
4. At the top of the dashboard you'll see three values — copy all three:
   - **Cloud Name** → this is `CLOUDINARY_CLOUD_NAME`
   - **API Key** → this is `CLOUDINARY_API_KEY`
   - **API Secret** → click the eye icon to reveal → this is `CLOUDINARY_API_SECRET`

That's it! No extra configuration needed.

---

### 3. OpenRouter (AI API)

OpenRouter lets you use DeepSeek AI (and many other models) through a single API.

**Steps:**

1. Go to **https://openrouter.ai/** and click **"Sign In"**
2. Sign in with Google or GitHub
3. After logging in, click your profile icon (top right) → **"API Keys"**
   - Or go directly to: **https://openrouter.ai/keys**
4. Click **"Create Key"** → Give it a name (e.g., "webgenai") → Click **"Create"**
5. Copy the key immediately — it starts with `sk-or-v1-...`
   - ⚠️ You won't be able to see it again after closing the dialog
   - This is your `OPENROUTER_API_KEY`
6. (Optional) Add free credits at **https://openrouter.ai/credits** — DeepSeek is very cheap (fractions of a cent per generation)

---

### 4. Firebase (Google Login)

Firebase handles the "Sign in with Google" button.

**Steps:**

1. Go to **https://console.firebase.google.com/**
2. Click **"Add Project"** → Name it (e.g., `webgenai`) → Click **Continue**
3. Disable Google Analytics (not needed) → Click **"Create Project"**
4. Once created, in the left sidebar click **"Authentication"**
5. Click **"Get started"** → Go to **"Sign-in method"** tab
6. Click **"Google"** → Toggle **Enable** → Add your email as support email → Click **Save**
7. Now in the left sidebar, click the **gear icon ⚙️** → **"Project Settings"**
8. Scroll down to **"Your apps"** → Click the **"</>"** (Web) icon
9. Register a nickname (e.g., `webgenai-web`) → Click **"Register app"**
10. You'll see a `firebaseConfig` object. **Copy the `apiKey` value** — this is your `VITE_FIREBASE_API_KEY`
11. Go back to **Authentication** → **Settings** tab → **"Authorized domains"**
12. Click **"Add domain"** → Add `localhost` → Click **Add**

---

## ⚙️ Backend Setup — Detailed Steps

Once all accounts are ready, follow these steps exactly.

### Step 1 — Open a Terminal and Go to the Backend Folder

If you downloaded the project as a ZIP and extracted it:

```bash
cd path/to/WebGenAI/backend
```

For example on Windows:
```bash
cd C:\Users\YourName\Downloads\WebGenAI\backend
```

For example on Mac/Linux:
```bash
cd ~/Downloads/WebGenAI/backend
```

Verify you're in the right place:
```bash
ls
# You should see: index.js  package.json  .envExample  controller/  models/  routes/  etc.
```

### Step 2 — Install All Dependencies

```bash
npm install
```

This downloads all required packages into a `node_modules` folder. It may take 1–2 minutes.

When complete you'll see something like:
```
added 312 packages in 45s
```

### Step 3 — Create Your `.env` File

**On Mac/Linux:**
```bash
cp .envExample .env
```

**On Windows (Command Prompt):**
```cmd
copy .envExample .env
```

**On Windows (PowerShell):**
```powershell
Copy-Item .envExample .env
```

Now open the `.env` file in your code editor and fill in all the values:

```env
MONGO_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/webgenai?retryWrites=true&w=majority
JWT_SECRET=paste_a_long_random_string_here
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name_from_cloudinary_dashboard
CLOUDINARY_API_KEY=your_api_key_from_cloudinary_dashboard
CLOUDINARY_API_SECRET=your_api_secret_from_cloudinary_dashboard
NODE_ENV=development
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```

**How to generate a strong JWT_SECRET:**

Open a new terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (a 64-character hex string) and paste it as your `JWT_SECRET`.

> ⚠️ **Important:** The `.env` file must be in the **root of the backend folder** — the same folder that contains `index.js` and `package.json`. Not inside any subfolder.

### Step 4 — Verify Your .env is Correct

Check that no value has a space after the `=` sign and no value is empty:

```bash
# On Mac/Linux — view the file:
cat .env

# On Windows:
type .env
```

Every line should look like `KEY=value` with no spaces around `=`.

### Step 5 — Start the Backend Server

```bash
npm run dev
```

**Expected output in terminal:**
```
[nodemon] starting `node index.js`
✅ Server running on http://localhost:8000
✅ MongoDB connected: cluster0.xxxxx.mongodb.net
```

If you see both green checkmarks, your backend is working correctly.

**Test it in your browser** — open **http://localhost:8000** and you should see:
```json
{ "status": "ok" }
```

---

## 🎨 Frontend Setup — Detailed Steps

Open a **new terminal window** (keep the backend terminal running).

### Step 1 — Go to the Frontend Folder

```bash
cd path/to/WebGenAI/frontend
```

Verify you're in the right place:
```bash
ls
# You should see: src/  public/  package.json  .envExample  vite.config.js  index.html
```

### Step 2 — Install All Dependencies

```bash
npm install
```

This downloads all required packages. The frontend has more dependencies so it may take 2–3 minutes.

### Step 3 — Create Your `.env` File

**On Mac/Linux:**
```bash
cp .envExample .env
```

**On Windows (Command Prompt):**
```cmd
copy .envExample .env
```

Open the `.env` file and fill in:

```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

- `VITE_API_URL` → The URL of your running backend. Leave it as `http://localhost:8000` for local development.
- `VITE_FIREBASE_API_KEY` → The `apiKey` you copied from Firebase Project Settings → Your Apps.

> ⚠️ **Important:** In Vite, ALL environment variable names must start with `VITE_` otherwise they won't be accessible in the browser. Do not change the variable names.

### Step 4 — Start the Frontend

```bash
npm run dev
```

**Expected output:**
```
  VITE v8.x.x  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and go to **http://localhost:5173**

You should see the WebGenAI homepage!

---

## 🔁 Running the App Locally

You need **two terminal windows open at the same time** — one for backend, one for frontend.

```
Terminal 1 (Backend)          Terminal 2 (Frontend)
─────────────────────         ──────────────────────
cd backend                    cd frontend
npm run dev                   npm run dev
                              
✅ Server on :8000            ➜ Local: http://localhost:5173
✅ MongoDB connected
```

Then open **http://localhost:5173** in your browser.

### Testing the Full Flow

1. Click **"Sign Up"** → Create an account with email + password
2. OR click **"Continue with Google"** to use Google login
3. After login you'll be redirected to the **Dashboard**
4. Click **"Generate"** in the sidebar
5. Type a prompt like: *"Create a restaurant website for an Italian place called Bella Roma with a menu section and reservation form"*
6. Click **Generate** → Wait 10–20 seconds
7. Your website appears in the editor with live preview on the right!

---

## 🌐 Production Deployment

### Backend → Render (Free Hosting)

**Step 1 — Push backend to GitHub:**

1. Create a new repository on **https://github.com/** (name it e.g. `webgenai-backend`)
2. In your backend folder:
   ```bash
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin https://github.com/yourusername/webgenai-backend.git
   git push -u origin main
   ```
   > Make sure `.env` is NOT committed — add it to `.gitignore` first if needed.

**Step 2 — Deploy on Render:**

1. Go to **https://render.com** → Sign up / Log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → Select your `webgenai-backend` repo
4. Fill in the settings:
   - **Name:** `webgenai-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Scroll down to **"Environment Variables"** → Click **"Add Environment Variable"** for each:

   | Key | Value |
   |---|---|
   | `MONGO_URI` | Your MongoDB Atlas URI |
   | `JWT_SECRET` | Your JWT secret |
   | `CLIENT_URL` | Your Vercel frontend URL (add after deploying frontend) |
   | `CLOUDINARY_CLOUD_NAME` | Your cloud name |
   | `CLOUDINARY_API_KEY` | Your API key |
   | `CLOUDINARY_API_SECRET` | Your API secret |
   | `NODE_ENV` | `production` |
   | `OPENROUTER_API_KEY` | Your OpenRouter key |

6. Click **"Create Web Service"** → Render will build and deploy (takes 2–5 minutes)
7. Copy your Render URL — it looks like: `https://webgenai-backend.onrender.com`

> ⚠️ **Free tier note:** Render free tier spins down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds. This is normal.

---

### Frontend → Vercel (Free Hosting)

**Step 1 — Push frontend to GitHub:**

1. Create a new repo on GitHub (name it e.g. `webgenai-frontend`)
2. In your frontend folder:
   ```bash
   git init
   git add .
   git commit -m "Initial frontend commit"
   git remote add origin https://github.com/yourusername/webgenai-frontend.git
   git push -u origin main
   ```

**Step 2 — Deploy on Vercel:**

1. Go to **https://vercel.com** → Sign up / Log in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find and click **"Import"** next to your `webgenai-frontend` repo
4. Vercel will auto-detect it as a **Vite** project
5. Click **"Environment Variables"** → Add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | Your Render backend URL (e.g. `https://webgenai-backend.onrender.com`) |
   | `VITE_FIREBASE_API_KEY` | Your Firebase API key |

6. Click **"Deploy"** → Takes about 1 minute
7. Your app is live at: `https://webgenai-xxxx.vercel.app`

**Step 3 — Update CORS on backend:**

Go back to Render → Your service → **Environment** tab → Update `CLIENT_URL`:
```
CLIENT_URL=https://webgenai-xxxx.vercel.app
```
Click **"Save Changes"** → Render will redeploy automatically.

**Step 4 — Add domain to Firebase:**

1. Go to Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Click **"Add domain"**
3. Add your Vercel domain (e.g. `webgenai-xxxx.vercel.app`)
4. Click **Add**

---

## 🔑 API Endpoints Reference

All endpoints are prefixed with your backend URL (e.g. `http://localhost:8000`).

### Auth — `/api/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | ❌ | Register with name, email, password |
| `POST` | `/api/auth/login` | ❌ | Login with email + password |
| `POST` | `/api/auth/google` | ❌ | Login/Register via Google Firebase token |
| `POST` | `/api/auth/logout` | ✅ | Clear JWT auth cookie |

### User — `/api/user`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/user/me` | ✅ | Get currently logged-in user data |
| `PATCH` | `/api/user/update` | ✅ | Update profile (name, bio, username, phone, socials, avatar) |
| `PATCH` | `/api/user/change-password` | ✅ | Change account password |

### Website — `/api/website`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/website/generate` | ✅ | Generate a new website from an AI prompt (costs credits) |
| `GET` | `/api/website/my-websites` | ✅ | Get all websites created by the logged-in user |
| `GET` | `/api/website/:id` | ✅ | Get a single website by its MongoDB ID |
| `GET` | `/api/website/live/:slug` | ❌ | Get a published website by its public slug |
| `PATCH` | `/api/website/:id` | ✅ | Update website title, HTML code, deploy status |
| `PATCH` | `/api/website/:id/update-with-ai` | ✅ | Modify existing website using a new AI prompt |
| `PATCH` | `/api/website/:id/star` | ✅ | Toggle star/unstar a website |
| `DELETE` | `/api/website/:id` | ✅ | Permanently delete a website |

---

## 🛠️ Common Issues & Fixes

### Backend Issues

| Problem | Cause | Fix |
|---|---|---|
| `MONGO_URI is undefined` | `.env` file is in wrong location | Make sure `.env` is in the root of `backend/` folder (same level as `index.js`) |
| `MongoDB connection failed: Authentication failed` | Wrong password in URI | Re-check your MongoDB Atlas password. Make sure you replaced `<password>` in the URI |
| `MongoDB connection failed: IP not whitelisted` | Your IP is blocked | Go to MongoDB Atlas → Network Access → Add IP Address → Add `0.0.0.0/0` |
| `Error: Cannot find module` | Missing dependencies | Run `npm install` again inside the `backend/` folder |
| `Port 8000 already in use` | Another process using port 8000 | Kill the process: `npx kill-port 8000` or restart your computer |
| CORS error in browser console | Frontend URL not in allowed origins | Set `CLIENT_URL=http://localhost:5173` in backend `.env` |

### Frontend Issues

| Problem | Cause | Fix |
|---|---|---|
| White screen / app doesn't load | Wrong `VITE_API_URL` | Make sure `VITE_API_URL=http://localhost:8000` (no trailing slash) |
| Google Sign-In popup closes immediately | Firebase domain not authorized | Add `localhost` to Firebase → Authentication → Authorized Domains |
| `VITE_FIREBASE_API_KEY is undefined` | `.env` file missing or in wrong location | Make sure `.env` is in root of `frontend/` folder (same level as `package.json`) |
| Network Error on all API calls | Backend not running | Start the backend first with `npm run dev` inside `backend/` |
| `npm install` fails | Old Node.js version | Run `node --version`. Must be v18+. Update from nodejs.org |

### Production Issues

| Problem | Cause | Fix |
|---|---|---|
| API calls fail in production | `VITE_API_URL` not updated | Set `VITE_API_URL` to your Render URL in Vercel environment variables |
| Google login fails in production | Vercel domain not in Firebase | Add your `.vercel.app` domain to Firebase → Authorized Domains |
| Backend returns 503 on first request | Render free tier spin-down | Normal behavior — wait 30 seconds for it to wake up |
| Cloudinary upload fails | Missing env variables | Verify all 3 Cloudinary vars are set in Render environment |
| AI generation fails | OpenRouter key issue | Check your key at openrouter.ai/keys and verify you have credits |

---

## 📦 Dependencies Overview

### Backend Dependencies

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | Web framework — handles HTTP routes and middleware |
| `mongoose` | ^9.6.2 | MongoDB Object Document Mapper (ODM) — defines schemas and queries |
| `bcryptjs` | ^3.0.3 | Hashes and compares passwords securely |
| `jsonwebtoken` | ^9.0.3 | Creates and verifies JWT tokens for auth |
| `cookie-parser` | ^1.4.7 | Parses cookies from incoming HTTP requests |
| `cors` | ^2.8.6 | Handles Cross-Origin Resource Sharing headers |
| `cloudinary` | ^2.10.0 | Cloudinary SDK for uploading and managing images |
| `multer` | ^2.1.1 | Handles `multipart/form-data` for file uploads |
| `dotenv` | ^17.4.2 | Loads environment variables from `.env` file |
| `nodemon` | ^3.1.14 | Auto-restarts server on file changes (dev only) |

### Frontend Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` + `react-dom` | ^19.2.6 | Core UI library |
| `vite` | ^8.0.12 | Build tool + fast dev server with HMR |
| `tailwindcss` | ^4.3.0 | Utility-first CSS framework |
| `react-router-dom` | ^7.15.0 | Client-side routing (SPA navigation) |
| `@reduxjs/toolkit` | ^2.11.2 | Simplified Redux for global state management |
| `react-redux` | ^9.2.0 | React bindings for Redux |
| `axios` | ^1.16.1 | HTTP client for backend API calls |
| `firebase` | ^12.13.0 | Google OAuth authentication |
| `@monaco-editor/react` | ^4.7.0 | VS Code-style code editor in the browser |
| `framer-motion` | ^12.39.0 | Smooth UI animations and transitions |
| `lucide-react` | ^1.16.0 | Clean icon library |
| `react-hot-toast` | ^2.6.0 | Toast notification popups |

---

## 👨‍💻 Author

**Varun** — BCA Final Year Project
**Project:** WebGenAI — AI-Powered Website Generator
**Stack:** MongoDB · Express · React · Node.js
**AI:** DeepSeek Chat via OpenRouter

---

<div align="center">

Made with ❤️ for BCA Final Year Project

</div>
