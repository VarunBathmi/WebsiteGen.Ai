import React, { useState } from "react";
import { AnimatePresence, easeOut, motion } from "motion/react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import InputField from "./InputField"; // ← shared field with Eye/EyeOff toggle
import { Sparkles } from "lucide-react";

const SignupModal = ({ open, onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setName(""); setEmail(""); setPassword(""); setConfirmPassword(""); setError("");
    }
  }, [open]);

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
        err?.response?.data?.message || "Registration failed. Please try again.",
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
      setError("Google sign-in failed. Please try again.");
    }
  };

  // Password strength meter
  const strength =
    password.length >= 12
      ? 4
      : password.length >= 9
        ? 3
        : password.length >= 6
          ? 2
          : password.length > 0
            ? 1
            : 0;
  const strengthColors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-400"];

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
            <div
              className="relative rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-lg)]"
            >
              {/* Ambient glows */}
              <motion.div
                animate={{ opacity: [0.25, 0.4, 0.25] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/30 blur-[140px] pointer-events-none"
              />
              <motion.div
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/25 blur-[140px] pointer-events-none"
              />

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-5 right-5 z-20 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
              >
                ✕
              </button>

              <div className="relative px-8 pt-10 pb-10 text-center">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] text-[#c084fc]"
                >
                  <Sparkles size={10} /> AI-Powered Website Builder
                </div>

                {/* Title */}
                <h2 className="text-3xl font-semibold leading-tight mb-2">
                  <span>Create your </span>
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    account
                  </span>
                </h2>
                <p className="text-[var(--text-muted)] text-sm mb-6">
                  Join and start building today
                </p>

                {/* Register Form */}
                <form
                  className="flex flex-col gap-3 text-left"
                  onSubmit={handleRegister}
                >
                  <InputField
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    id="signup-name"
                  />
                  <InputField
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    autoComplete="email"
                    id="signup-email"
                  />
                  <InputField
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    autoComplete="new-password"
                    id="signup-password"
                  />
                  <InputField
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    id="signup-confirm-password"
                  />

                  {/* Password strength */}
                  {strength > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-1.5 px-1"
                    >
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            level <= strength
                              ? strengthColors[strength - 1]
                              : "bg-[var(--bg-card)]"
                          }`}
                        />
                      ))}
                    </motion.div>
                  )}

                  {/* Error */}
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
                    type="submit"
                    whileHover={!loading ? { scale: 1.03 } : {}}
                    whileTap={!loading ? { scale: 0.97 } : {}}
                    disabled={loading}
                    className="w-full h-12 mt-1 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-sm shadow-lg hover:shadow-purple-500/25 transition-shadow duration-300 disabled:opacity-60"
                  >
                    {loading ? "Creating account…" : "Create Account"}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                  <div className="h-px flex-1 bg-[var(--border)]" />
                  <span className="text-xs text-[var(--text-muted)] tracking-wide">or</span>
                  <div className="h-px flex-1 bg-[var(--border)]" />
                </div>

                {/* Google */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleGoogleAuth}
                  className="w-full h-12 rounded-xl bg-white text-black font-semibold text-sm shadow-xl flex items-center justify-center gap-3"
                >
                  <img
                    src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
                    alt=""
                    aria-hidden
                    className="h-5 w-5"
                  />
                  Continue with Google
                </motion.button>

                {/* Switch to Login */}
                <p className="text-xs text-[var(--text-muted)] mt-5">
                  Already have an account?{" "}
                  <button
                    type="button"
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
