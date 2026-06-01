import React, { useState } from "react";
import { AnimatePresence, easeOut, motion } from "motion/react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const InputField = ({ type, value, onChange, placeholder, icon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative w-full">
      <motion.div
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none"
      />
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm pointer-events-none select-none">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full h-12 ${icon ? "pl-10" : "pl-4"} pr-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] outline-none focus:border-purple-500/50 transition-colors duration-200`}
      />
    </div>
  );
};

const SignupModal = ({ open, onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/register`,
        { name, email, password },
        { withCredentials: true },
      );
      dispatch(setUserData(data));
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google`,
        {
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(data));
      onClose();
    } catch (error) {
      if (error?.code === "auth/cancelled-popup-request") return;
      if (error?.code === "auth/popup-closed-by-user") return;
      console.error("Google auth failed:", error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose()}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ duration: 0.45, ease: easeOut }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md p-[1px] rounded-3xl bg-gradient-to-r from-purple-500/40 via-blue-500/30 to-transparent"
          >
            <div className="relative rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-lg)' }}>
              {/* Ambient glows */}
              <motion.div
                animate={{ opacity: [0.25, 0.4, 0.25] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/30 blur-[140px]"
              />
              <motion.div
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/25 blur-[140px]"
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-20 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-lg"
              >
                ✕
              </button>

              <div className="relative px-8 pt-10 pb-10 text-center">
                {/* Badge */}
                <h1 className="inline-block mb-5 px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)]">
                  AI-Powered Website Builder
                </h1>

                {/* Title */}
                <h2 className="text-3xl font-semibold leading-tight mb-2">
                  <span>Create your </span>
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    account
                  </span>
                </h2>
                <p className="text-[var(--text-muted)] text-sm mb-6">
                  Join WebGen.ai and start building today
                </p>

                {/* ── Register Form ── */}
                <div className="flex flex-col gap-3 text-left">
                  <InputField
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    // icon="👤"
                  />
                  <InputField
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    // icon="✉️"
                  />
                  <InputField
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    // icon="🔒"
                  />
                  <InputField
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    // icon="🔒"
                  />

                  {/* Password strength hint */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-1.5 px-1"
                    >
                      {[1, 2, 3, 4].map((level) => {
                        const strength =
                          password.length >= 12
                            ? 4
                            : password.length >= 9
                              ? 3
                              : password.length >= 6
                                ? 2
                                : 1;
                        const colors = [
                          "bg-red-500",
                          "bg-orange-400",
                          "bg-yellow-400",
                          "bg-green-400",
                        ];
                        return (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              level <= strength
                                ? colors[strength - 1]
                                : "bg-[var(--bg-card)]"
                            }`}
                          />
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-400 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full h-12 mt-1 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-sm shadow-lg hover:shadow-purple-500/25 transition-shadow duration-300 disabled:opacity-60"
                  >
                    {loading ? "Creating account…" : "Create Account"}
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                  <div className="h-px flex-1 bg-[var(--bg-card)]" />
                  <span className="text-xs text-[var(--text-muted)] tracking-wide">
                    or
                  </span>
                  <div className="h-px flex-1 bg-[var(--bg-card)]" />
                </div>

                {/* Google Button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleGoogleAuth}
                  className="w-full h-12 rounded-xl bg-white text-black font-semibold text-sm shadow-xl flex items-center justify-center gap-3"
                >
                  <img
                    src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
                    alt="google"
                    className="h-5 w-5"
                  />
                  Continue with Google
                </motion.button>

                {/* Switch to Login */}
                <p className="text-xs text-[var(--text-muted)] mt-5">
                  Already have an account?{" "}
                  <button
                    onClick={onSwitchToLogin}
                    className="text-purple-400 hover:text-purple-300 transition font-medium underline underline-offset-2"
                  >
                    Sign in
                  </button>
                </p>

                {/* Terms */}
                <p className="text-xs text-zinc-600 leading-relaxed mt-3">
                  By continuing, you agree to{" "}
                  <span className="underline cursor-pointer hover:text-[var(--text-primary)]">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="underline cursor-pointer hover:text-[var(--text-primary)]">
                    Privacy Policy
                  </span>
                  .
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignupModal;
