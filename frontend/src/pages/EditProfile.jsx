import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  User,
  Shield,
  Palette,
  Camera,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import toast from "react-hot-toast";
import { setUserData } from "../redux/userSlice";
import { serverUrl } from "../App";

// ── Shared input field ────────────────────────────────────
const Field = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
}) => {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div>
      {label && (
        <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPass && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2.5 text-[13px] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-all disabled:opacity-50"
          style={{
            background: "var(--bg-base)",
            border: "1px solid var(--border)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Section card wrapper ──────────────────────────────────
const Section = ({ title, children }) => (
  <div
    className="rounded-2xl p-5 mb-4"
    style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
    }}
  >
    {title && (
      <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mb-4">
        {title}
      </h3>
    )}
    {children}
  </div>
);

// ══ TAB 1: Personal Information ═══════════════════════════
const PersonalTab = () => {
  const { userData } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: userData?.name || "",
    username: userData?.username || "",
    phone: userData?.phone || "",
    country: userData?.country || "",
    bio: userData?.bio || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    setSaving(true);
    try {
      let avatarUrl = userData?.avatar;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const { data } = await axios.post(`${serverUrl}/api/user/avatar`, fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        avatarUrl = data.avatar;
      }
      const { data } = await axios.put(
        `${serverUrl}/api/user/profile`,
        { ...form, avatar: avatarUrl },
        { withCredentials: true },
      );
      dispatch(setUserData(data.user));
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      <Section title="Profile Photo">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-lg font-bold text-white"
              style={{
                background: avatarPreview
                  ? "transparent"
                  : "linear-gradient(135deg, var(--accent), #3b82f6)",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white"
              style={{ background: "var(--accent)" }}
            >
              <Camera size={11} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[var(--text-primary)]">
              {form.name || "Your Name"}
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-[11px] hover:underline mt-0.5"
              style={{ color: "var(--accent)" }}
            >
              Upload new photo
            </button>
          </div>
        </div>
      </Section>

      <Section title="Basic Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Full Name *"
            value={form.name}
            onChange={set("name")}
            placeholder="Jane Doe"
          />
          <Field
            label="Username"
            value={form.username}
            onChange={set("username")}
            placeholder="janedoe"
          />
          <Field
            label="Phone"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+91 9876543210"
          />
          <Field
            label="Country"
            value={form.country}
            onChange={set("country")}
            placeholder="India"
          />
        </div>
        <div className="mt-3">
          <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={set("bio")}
            placeholder="Short bio…"
            rows={3}
            className="w-full px-3 py-2.5 text-[13px] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none transition-all"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, var(--accent), #3b82f6)",
          }}
        >
          {saving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
          {saving ? "Saving…" : "Save Changes"}
        </motion.button>
      </div>
    </>
  );
};

// ══ TAB 2: Security ════════════════════════════════════════
const SecurityTab = () => {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    if (!form.current || !form.next) {
      toast.error("Fill all fields");
      return;
    }
    if (form.next !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.next.length < 8) {
      toast.error("Min 8 characters");
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        `${serverUrl}/api/user/password`,
        { currentPassword: form.current, newPassword: form.next },
        { withCredentials: true },
      );
      toast.success("Password updated!");
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Change Password">
      <div className="space-y-3 max-w-sm">
        <Field
          label="Current Password"
          type="password"
          value={form.current}
          onChange={set("current")}
          placeholder="••••••••"
        />
        <Field
          label="New Password"
          type="password"
          value={form.next}
          onChange={set("next")}
          placeholder="Min 8 characters"
        />
        <Field
          label="Confirm New Password"
          type="password"
          value={form.confirm}
          onChange={set("confirm")}
          placeholder="Repeat new password"
        />
      </div>
      <div className="mt-4 flex justify-end max-w-sm">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, var(--accent), #3b82f6)",
          }}
        >
          {saving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Shield size={13} />
          )}
          {saving ? "Updating…" : "Update Password"}
        </motion.button>
      </div>
    </Section>
  );
};

// ══ TAB 3: Appearance ══════════════════════════════════════
const AppearanceTab = () => {
  const { theme, toggleTheme } = useTheme();

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <Section title="Theme">
      <div className="grid grid-cols-3 gap-3">
        {options.map(({ value, icon: Icon, label }) => {
          const isCurrentTheme = theme === value;
          return (
            <button
              key={value}
              onClick={() => {
                if (value !== "system" && theme !== value) toggleTheme();
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
              style={{
                border: `1px solid ${isCurrentTheme || value === "system" ? "var(--accent)" : "var(--border)"}`,
                background: isCurrentTheme
                  ? "var(--accent-glow)"
                  : "var(--bg-base)",
              }}
            >
              <Icon
                size={18}
                style={{
                  color: isCurrentTheme ? "var(--accent)" : "var(--text-muted)",
                }}
              />
              <span
                className="text-[12px] font-medium"
                style={{
                  color: isCurrentTheme ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
};

// ══ ONLY 3 TABS — Notifications & Preferences removed ══════
const TABS = [
  { id: "personal", label: "Personal Information", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const EditProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();

  const renderTab = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalTab />;
      case "security":
        return <SecurityTab />;
      case "appearance":
        return <AppearanceTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 h-14 flex items-center px-5 sm:px-8"
        style={{
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-5xl mx-auto w-full flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[15px] font-semibold text-[var(--text-primary)]">
            Edit Profile
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar tabs */}
          <aside className="sm:w-52 shrink-0">
            <nav className="flex flex-row sm:flex-col gap-1 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left whitespace-nowrap transition-all duration-150 text-[12px] font-medium shrink-0"
                  style={{
                    background:
                      activeTab === id ? "var(--accent-glow)" : "transparent",
                    color:
                      activeTab === id ? "var(--accent)" : "var(--text-muted)",
                    border: `1px solid ${activeTab === id ? "var(--accent)" : "transparent"}`,
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Tab content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
