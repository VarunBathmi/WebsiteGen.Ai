import React, { useState, useEffect } from "react";
import { AnimatePresence, easeOut, motion } from "motion/react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import InputField from "./InputField";
import { Sparkles } from "lucide-react";

const LoginModal = ({ open, onClose, onSwitchToSignup }) => {
  const dispatch = useDispatch();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setEmail(""); setPassword(""); setError("");
    }
  }, [open]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
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
          name:   result.user.displayName,
          email:  result.user.email,
          avatar: result.user.photoURL,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      onClose();
    } catch (err) {
      if (err?.code === "auth/cancelled-popup-request") return;
      if (err?.code === "auth/popup-closed-by-user") return;
      setError("Google sign-in failed. Please try again.");
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleEmailLogin(e);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/75 backdrop-blur-[16px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: easeOut }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[400px] rounded-3xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-lg)]"
          >
            {/* Ambient glow */}
            <div
              aria-hidden
              className="absolute -top-24 -left-24 w-64 h-64 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(168,85,247,0.15),transparent_70%)]"
            />
            <div
              aria-hidden
              className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(59,130,246,0.1),transparent_70%)]"
            />

            <div className="relative px-7 pt-8 pb-8">
              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-150"
              >
                ✕
              </button>

              {/* Header */}
              <div className="text-center mb-7">
                <div
                  className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] text-[#c084fc]"
                >
                  <Sparkles size={10} /> AI-Powered Website Builder
                </div>
                <h2 className="text-2xl font-bold mb-1.5">
                  Welcome{" "}
                  <span
                    className="bg-gradient-to-r from-[#c084fc] to-[#60a5fa] bg-clip-text text-transparent"
                  >
                    back
                  </span>
                </h2>
                <p className="text-sm text-[var(--text-muted)]">Sign in to continue building</p>
              </div>

              {/* Form */}
              <form className="flex flex-col gap-2.5" onSubmit={handleEmailLogin}>
                <InputField
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  autoComplete="email"
                  id="login-email"
                />
                <InputField
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  id="login-password"
                />

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
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  disabled={loading}
                  className="w-full h-11 mt-1 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 bg-gradient-to-br from-[#a855f7] to-[#3b82f6]"
                >
                  {loading ? "Signing in…" : "Sign In"}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-xs text-zinc-600">or</span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>

              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGoogleAuth}
                className="w-full h-11 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-[0_2px_12px_var(--border)]"
              >
                <img
                  src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
                  alt=""
                  aria-hidden
                  className="h-4.5 w-4.5"
                />
                Continue with Google
              </motion.button>

              {/* Switch */}
              <p className="text-xs text-zinc-600 text-center mt-5">
                No account?{" "}
                <button
                  onClick={onSwitchToSignup}
                  className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  Sign up free
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
