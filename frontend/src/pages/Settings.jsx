import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Moon, Sun, Monitor, User, Trash2, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";

const Section = ({ title, children }) => (
  <div
    className="rounded-2xl p-5 mb-4 bg-[var(--bg-elevated)] border border-[var(--border)]"
  >
    {title && <h3 className="text-[13px] font-semibold mb-4">{title}</h3>}
    {children}
  </div>
);

// 3-way theme option button
const ThemeOption = ({ label, icon: Icon, value, current, onClick }) => {
  const active = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      aria-pressed={active}
      className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-[12px] font-medium transition-all flex-1 ${
        active
          ? "bg-[var(--accent-glow)] border-[1.5px] border-[var(--accent)] text-[var(--accent)]"
          : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
};

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, preference, setTheme, toggleTheme } = useTheme();
  const { userData } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const [deleting, setDeleting] = useState(false);

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

  // Friendly label for the current resolved theme
  const themeLabel = {
    light: "Light theme active",
    dark: "Dark theme active",
  }[theme];

  return (
    <div
      className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]"
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 h-14 flex items-center px-5 sm:px-8 bg-[var(--bg-elevated)] border-b border-[var(--border)] backdrop-blur-[20px]"
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
          <div>
            <div className="flex items-center gap-2 mb-3">
              {theme === "dark" ? (
                <Moon size={15} className="text-[var(--text-muted)]" />
              ) : (
                <Sun size={15} className="text-[var(--text-muted)]" />
              )}
              <div>
                <p className="text-[13px] font-medium">Theme</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {preference === "system"
                    ? `System preference — ${themeLabel}`
                    : themeLabel}
                </p>
              </div>
            </div>

            {/* 3-way selector */}
            <div className="flex gap-2 mt-3">
              <ThemeOption
                label="Light"
                icon={Sun}
                value="light"
                current={preference}
                onClick={setTheme}
              />
              <ThemeOption
                label="Dark"
                icon={Moon}
                value="dark"
                current={preference}
                onClick={setTheme}
              />
              <ThemeOption
                label="System"
                icon={Monitor}
                value="system"
                current={preference}
                onClick={setTheme}
              />
            </div>
          </div>
        </Section>

        {/* ── Account ── */}
        <Section title="Account">
          <div className="space-y-3">
            <button
              onClick={() => navigate("/edit-profile")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-[var(--bg-card-hover)] border border-[var(--border)]"
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
            className="flex items-center justify-between p-4 rounded-xl mb-3 bg-[var(--bg-base)] border border-[var(--border)]"
          >
            <div>
              <p className="text-[13px] font-medium">Available Credits</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Used for website generation & updates
              </p>
            </div>
            <span
              className={`text-xl font-bold ${
                (userData?.credits ?? 0) < 20 ? "text-[#ef4444]" : "text-[var(--accent)]"
              }`}
            >
              {userData?.credits ?? 0}
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden bg-[var(--border)]"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(((userData?.credits ?? 0) / 500) * 100, 100)}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                (userData?.credits ?? 0) < 20
                  ? "bg-[linear-gradient(90deg,#ef4444,#f97316)]"
                  : "bg-[linear-gradient(90deg,var(--accent),#3b82f6)]"
              }`}
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
