import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Pencil,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import { serverUrl } from "../App";
import toast from "react-hot-toast";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${serverUrl}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      dispatch(setUserData(null));
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      dispatch(setUserData(null));
      navigate("/");
    }
  };

  const initials = userData?.name
    ? userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // ── Sirf 3 items — Billing & Credits removed ──
  const menuItems = [
    { icon: User, label: "Profile", action: () => navigate("/profile") },
    {
      icon: Pencil,
      label: "Edit Profile",
      action: () => navigate("/edit-profile"),
    },
    { icon: Settings, label: "Settings", action: () => navigate("/settings") },
  ];

  return (
    <div ref={ref} className="relative select-none">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-[var(--bg-card-hover)]"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden shrink-0 text-white ${
            userData?.avatar
              ? "bg-transparent"
              : "bg-[linear-gradient(135deg,var(--accent),#3b82f6)]"
          }`}
        >
          {userData?.avatar ? (
            <img
              src={userData.avatar}
              alt="avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            initials
          )}
        </div>

        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-[13px] font-semibold text-[var(--text-primary)] max-w-[110px] truncate">
            {userData?.name || "User"}
          </span>
          <span className="text-[11px] text-[var(--text-muted)] max-w-[110px] truncate">
            {userData?.email || ""}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`text-[var(--text-muted)] transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 mt-2 w-64 z-50 rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-lg)] backdrop-blur-[24px]"
          >
            {/* Header — name + email only, no plan badge */}
            <div className="px-4 py-4 flex items-center gap-3 border-b border-[var(--border)]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden shrink-0 text-white ${
                  userData?.avatar
                    ? "bg-transparent"
                    : "bg-[linear-gradient(135deg,var(--accent),#3b82f6)]"
                }`}
              >
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                  {userData?.name || "User"}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">
                  {userData?.email || ""}
                </p>
              </div>
            </div>

            {/* Menu items — Profile, Edit Profile, Settings only */}
            <div className="py-1.5">
              {menuItems.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={() => {
                    setOpen(false);
                    action();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-150 text-left"
                >
                  <Icon
                    size={15}
                    className="shrink-0 text-[var(--text-muted)]"
                  />
                  {label}
                </button>
              ))}
            </div>

            {/* Dark mode toggle */}
            <div className="px-4 py-2.5 flex items-center justify-between border-t border-[var(--border)]">
              <div className="flex items-center gap-3 text-[13px] text-[var(--text-secondary)]">
                {theme === "dark" ? (
                  <Moon size={15} className="text-[var(--text-muted)]" />
                ) : (
                  <Sun size={15} className="text-[var(--text-muted)]" />
                )}
                Dark Mode
              </div>
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className={`relative w-10 h-5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                  theme === "dark"
                    ? "bg-[var(--accent)]"
                    : "bg-[var(--border-strong)]"
                }`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm ${
                    theme === "dark" ? "left-[calc(100%-18px)]" : "left-[2px]"
                  }`}
                />
              </button>
            </div>

            {/* Sign out */}
            <div className="pb-1.5 border-t border-[var(--border)]">
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 text-left mt-1"
              >
                <LogOut size={15} className="shrink-0" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
