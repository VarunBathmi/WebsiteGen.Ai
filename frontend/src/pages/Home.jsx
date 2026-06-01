import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal";
import { useDispatch, useSelector } from "react-redux";
import {
  Coins,
  Sparkles,
  Zap,
  Globe,
  Code2,
  Layers,
  ArrowRight,
  User,
  Pencil,
  Settings,
  LogOut,
} from "lucide-react";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const HIGHLIGHTS = [
  {
    icon: <Code2 size={20} />,
    title: "AI Generated Code",
    description:
      "WebGen.ai builds real websites — clean code, animations, responsiveness and scalable structure.",
  },
  {
    icon: <Layers size={20} />,
    title: "Fully Responsive Layouts",
    description:
      "Every design automatically adapts to mobile, tablet, and desktop screens for a flawless user experience.",
  },
  {
    icon: <Zap size={20} />,
    title: "Production Ready Output",
    description:
      "Export optimized, deployment-ready code you can push straight to your hosting platform.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Lightning Fast Performance",
    description:
      "Generated with modern frameworks and best practices to ensure top-tier loading speeds and optimal SEO.",
  },
  {
    icon: <Globe size={20} />,
    title: "Customizable Components",
    description:
      "Easily tweak, modify, and style generated sections to perfectly match your brand's unique identity.",
  },
  {
    icon: <ArrowRight size={20} />,
    title: "Seamless Integrations",
    description:
      "Connect your generated frontend with your favorite APIs, databases, and third-party tools instantly.",
  },
];

const Home = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (openLogin || openSignup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openLogin, openSignup]);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      setOpenProfile(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  // TO:
  const menuItems = [
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Pencil, label: "Edit Profile", path: "/edit-profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Ambient gradient blobs */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      >
        <div
          className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #a855f7, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #3b82f6, transparent 70%)",
          }}
        />
      </div>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-primary)]"
              style={{ background: "linear-gradient(135deg,#a855f7,#3b82f6)" }}
            >
              <Sparkles size={14} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              WebGen.ai
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="hidden md:inline text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 px-2 py-1">
              Pricing
            </button>

            {/* Credits badge — desktop */}
            {userData && (
              <div
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <Coins size={13} className="text-yellow-400" />
                <span className="text-[var(--text-primary)] text-xs">
                  {userData?.credits} credits
                </span>
              </div>
            )}

            {!userData ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpenLogin(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{
                  background: "var(--bg-card-hover)",
                  border: "1px solid var(--border)",
                }}
              >
                Get Started
              </motion.button>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setOpenProfile((p) => !p)}
                  className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-purple-500/50 transition-all duration-200"
                  aria-label="Open profile menu"
                  aria-expanded={openProfile}
                >
                  <img
                    src={
                      userData?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name)}&background=a855f7&color=fff`
                    }
                    alt={userData?.name}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name)}&background=a855f7&color=fff`;
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>

                <AnimatePresence>
                  {openProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                      role="menu"
                      className="absolute right-0 mt-2 w-56 z-50 rounded-2xl overflow-hidden"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-lg)",
                      }}
                    >
                      {/* User info */}
                      <div
                        className="px-4 py-3"
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <p className="text-sm font-medium truncate">
                          {userData.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                          {userData.email}
                        </p>
                      </div>

                      {/* Mobile credits */}
                      <button
                        className="md:hidden w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-[var(--bg-card-hover)] transition-colors"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        role="menuitem"
                      >
                        <Coins size={13} className="text-yellow-400" />
                        <span className="text-[var(--text-primary)]">
                          {userData?.credits} credits
                        </span>
                      </button>

                      {/* Dashboard */}
                      <button
                        onClick={() => {
                          navigate("/dashboard");
                          setOpenProfile(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--bg-card-hover)] transition-colors"
                        role="menuitem"
                      >
                        Dashboard
                      </button>

                      {/* Dynamic menu items */}
                      {menuItems.map(({ icon: Icon, label, path }) => (
                        <button
                          key={label}
                          onClick={() => {
                            navigate(path);
                            setOpenProfile(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-2.5"
                          role="menuitem"
                        >
                          <Icon
                            size={14}
                            className="text-[var(--text-muted)] shrink-0"
                          />
                          {label}
                        </button>
                      ))}

                      {/* Sign out */}
                      <button
                        onClick={handleLogOut}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-[var(--bg-card-hover)] transition-colors   flex items-center gap-2.5"
                        style={{ borderTop: "1px solid var(--border)" }}
                        role="menuitem"
                      >
                        <LogOut size={13} className="shrink-0" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 pt-40 pb-28 px-5 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-1.5 mb-7 px-3.5 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "rgba(168,85,247,0.1)",
            border: "1px solid rgba(168,85,247,0.25)",
            color: "#c084fc",
          }}
        >
          <Sparkles size={11} />
          AI-Powered Website Builder
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-7"
        >
          Build Stunning Websites
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            with AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Describe your idea and let AI generate a modern, responsive,
          production-ready website in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              userData ? navigate("/dashboard") : setOpenLogin(true)
            }
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-black"
            style={{
              background: "linear-gradient(135deg, #e2e8f0, #ffffff)",
              boxShadow: "0 4px 24px var(--border)",
            }}
          >
            {userData ? "Go to Dashboard" : "Start Building Free"}
            <ArrowRight size={15} />
          </motion.button>

          {!userData && (
            <button
              onClick={() => setOpenSignup(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors"
              style={{ border: "1px solid var(--border)" }}
            >
              Create account
            </button>
          )}
        </motion.div>
      </section>

      {/* ── Feature Grid ───────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HIGHLIGHTS.map((h, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.45,
                delay: i * 0.07,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="group rounded-2xl p-7 transition-all duration-300 cursor-default"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.055)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-card)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-5 text-purple-400"
                style={{ background: "rgba(168,85,247,0.1)" }}
              >
                {h.icon}
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2.5">
                {h.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {h.description}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="relative z-10 py-8 text-center text-sm text-zinc-600"
        style={{ borderTop: "1px solid var(--bg-card-hover)" }}
      >
        <span>
          &copy; {new Date().getFullYear()} WebGen.ai. All rights reserved.
        </span>
      </footer>

      {/* ── Modals ─────────────────────────────────────────── */}
      <AnimatePresence>
        {openLogin && (
          <LoginModal
            open={openLogin}
            onClose={() => setOpenLogin(false)}
            onSwitchToSignup={() => {
              setOpenLogin(false);
              setOpenSignup(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openSignup && (
          <SignupModal
            open={openSignup}
            onClose={() => setOpenSignup(false)}
            onSwitchToLogin={() => {
              setOpenSignup(false);
              setOpenLogin(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
