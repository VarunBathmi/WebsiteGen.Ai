import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Moon, Sun, User, Trash2, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";

const Section = ({ title, children }) => (
  <div
    className="rounded-2xl p-5 mb-4"
    style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
    }}
  >
    {title && <h3 className="text-[13px] font-semibold mb-4">{title}</h3>}
    {children}
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { userData } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const [deleting, setDeleting] = useState(false);

  // Auto-scroll to billing section if ?tab=billing
  const isBilling = searchParams.get("tab") === "billing";

  const handleDeleteAccount = () => {
    toast(
      (t) => (
        <div>
          <p className="text-sm font-medium mb-1">Delete your account?</p>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            This action is permanent and cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setDeleting(true);
                try {
                  await axios.delete(`${serverUrl}/api/user/account`, {
                    withCredentials: true,
                  });
                  dispatch(setUserData(null));
                  toast.success("Account deleted.");
                  navigate("/");
                } catch (err) {
                  toast.error(
                    err?.response?.data?.message || "Failed to delete account.",
                  );
                } finally {
                  setDeleting(false);
                }
              }}
              className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 8000, id: "delete-account" },
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 h-14 flex items-center px-5 sm:px-8"
        style={{
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[15px] font-semibold">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-10 space-y-4">
        {/* ── Appearance ── */}
        <Section title="Appearance">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon size={16} className="text-[var(--text-muted)]" />
              ) : (
                <Sun size={16} className="text-[var(--text-muted)]" />
              )}
              <div>
                <p className="text-[13px] font-medium">Dark Mode</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {theme === "dark"
                    ? "Currently using dark theme"
                    : "Currently using light theme"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none"
              style={{
                background:
                  theme === "dark" ? "var(--accent)" : "var(--border-strong)",
              }}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                style={{ left: theme === "dark" ? "calc(100% - 20px)" : "4px" }}
              />
            </button>
          </div>
        </Section>

        {/* ── Account ── */}
        <Section title="Account">
          <div className="space-y-3">
            <button
              onClick={() => navigate("/edit-profile")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-[var(--bg-card-hover)]"
              style={{ border: "1px solid var(--border)" }}
            >
              <User size={15} className="text-[var(--text-muted)]" />
              <div>
                <p className="text-[13px] font-medium">Edit Profile</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Update name, avatar, bio and more
                </p>
              </div>
            </button>
          </div>
        </Section>

        {/* ── Credits / Billing ── */}
        <Section title="Credits & Billing">
          <div
            className="flex items-center justify-between p-4 rounded-xl mb-3"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <p className="text-[13px] font-medium">Available Credits</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Used for website generation & updates
              </p>
            </div>
            <span
              className="text-xl font-bold"
              style={{
                color:
                  (userData?.credits ?? 0) < 20 ? "#ef4444" : "var(--accent)",
              }}
            >
              {userData?.credits ?? 0}
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--border)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(((userData?.credits ?? 0) / 500) * 100, 100)}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  (userData?.credits ?? 0) < 20
                    ? "linear-gradient(90deg,#ef4444,#f97316)"
                    : "linear-gradient(90deg,var(--accent),#3b82f6)",
              }}
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-2">
            Generate costs 50 credits · Update costs 25 credits
          </p>
        </Section>

        {/* ── Danger Zone ── */}
        <Section title="Danger Zone">
          <p className="text-[12px] text-[var(--text-muted)] mb-4">
            Permanently delete your account and all associated websites. This
            cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 text-[13px] font-semibold border border-red-500/30 hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {deleting ? "Deleting…" : "Delete Account"}
          </button>
        </Section>
      </main>
    </div>
  );
};

export default Settings;
