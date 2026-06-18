import React, { useState, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, Menu, Sparkles, PanelLeftOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import CreditUsageBar from "../components/CreditUsageBar";

const Generate = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((s) => s.user);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [loadingW, setLoadingW] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
      .then(({ data }) => setWebsites(data || []))
      .catch(() => {})
      .finally(() => setLoadingW(false));
  }, []);

  // Auto-resize textarea — but cap at available space
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [prompt]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/website/generate`,
        { prompt },
        { withCredentials: true },
      );
      navigate(`/editor/${data.websiteId}`);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Generation failed. Please try again.",
      );
      setLoading(false);
    }
  }, [prompt, loading, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  const handlePromptSelect = (p) => {
    setPrompt(p);
    setSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleWebsiteDeleted = (id) =>
    setWebsites((prev) => prev.filter((w) => w._id !== id));

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <style>{`@keyframes sbpulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>

      {/* ── Desktop sidebar ── */}
      {!sidebarCollapsed && (
        <div className="hidden md:flex h-screen shrink-0">
          <Sidebar
            onPromptSelect={handlePromptSelect}
            onClose={() => setSidebarCollapsed(true)}
            websites={websites}
            loadingWebsites={loadingW}
            onWebsiteDeleted={handleWebsiteDeleted}
          />
        </div>
      )}

      {/* ── Collapsed strip ── */}
      {sidebarCollapsed && (
        <div className="hidden md:flex w-[44px] h-screen shrink-0 bg-[var(--bg-elevated)] border-r border-[var(--border)] flex-col items-center pt-[14px]">
          <button
            onClick={() => setSidebarCollapsed(false)}
            title="Open sidebar"
            className="w-7 h-7 rounded-[6px] border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            <PanelLeftOpen size={15} color="var(--text-secondary)" />
          </button>
        </div>
      )}

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile slide-in ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -270 }}
            animate={{ x: 0 }}
            exit={{ x: -270 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 h-screen"
          >
            <Sidebar
              isMobile
              onPromptSelect={handlePromptSelect}
              onClose={() => setSidebarOpen(false)}
              websites={websites}
              loadingWebsites={loadingW}
              onWebsiteDeleted={handleWebsiteDeleted}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Header ── */}
        <header className="sticky top-0 z-30 shrink-0 backdrop-blur-[20px] bg-[var(--bg-elevated)] border-b border-[var(--border)]">
          <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
            {/* Left — mobile hamburger */}
            <div className="flex items-center">
              <button
                className="flex md:hidden p-2 rounded-lg text-[var(--text-secondary)]"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu size={16} />
              </button>
            </div>

            {/* Right — credit bar + back */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <CreditUsageBar compact />
              </div>
              <div className="hidden sm:block w-px h-5 bg-[var(--border)]" />
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1.5 p-2 rounded-lg transition-all text-[var(--text-secondary)] hover:text-black dark:hover:text-white"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline text-sm font-medium">
                  Dashboard
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Main — fills remaining height, content centered inside ── */}
        <main className="flex-1 overflow-y-auto flex items-center">
          <div className="w-full max-w-[680px] mx-auto px-5 py-4">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="text-center mb-6"
            >
              <div
                className="inline-flex items-center gap-1.5 mb-3.5 px-3.5 py-1.25 rounded-full text-[11px] font-medium bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.25)] text-[#c084fc]"
              >
                <Sparkles size={11} /> Real AI Power
              </div>

              <h1 className="text-[clamp(24px,4vw,42px)] font-bold tracking-[-0.5px] leading-[1.15] mb-2.5 text-[var(--text-primary)]">
                Build Website with{" "}
                <span className="bg-gradient-to-r from-[#f0f0f0] to-[#a1a1aa] bg-clip-text text-transparent">
                  Real AI Power
                </span>
              </h1>

              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[460px] mx-auto">
                This process may take a few minutes. WebGen.ai focuses on
                quality, not shortcuts.
              </p>
            </motion.div>

            {/* Prompt box */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-4"
            >
              <label
                htmlFor="prompt"
                className="block text-[13px] font-medium mb-2 text-[var(--text-primary)]"
              >
                Describe your website
              </label>

              <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
                <textarea
                  id="prompt"
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. A modern SaaS landing page for a project management tool with dark theme, animated hero section, pricing table, and testimonials..."
                  disabled={loading}
                  rows={4}
                  className={`w-full px-[18px] py-[14px] bg-transparent border-none outline-none resize-none text-[13px] leading-[1.65] text-[var(--text-primary)] font-[inherit] min-h-0 max-h-[30vh] overflow-y-auto ${
                    loading ? "opacity-50" : "opacity-100"
                  }`}
                />
                <div className="flex items-center justify-between px-[18px] py-2 border-t border-[var(--border)]">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {prompt.length > 0 ? `${prompt.length} chars` : ""}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {typeof navigator !== "undefined" &&
                    navigator?.platform?.toLowerCase().includes("mac")
                      ? "⌘"
                      : "Ctrl"}
                    +Enter to generate
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[13px] text-[#f87171] text-center mb-3"
              >
                {error}
              </motion.p>
            )}

            {/* Generate button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.18 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={!loading ? { scale: 1.04 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className={`inline-flex items-center gap-2.5 px-9 py-[13px] rounded-2xl font-semibold text-sm text-white bg-gradient-to-br from-[#a855f7] to-[#3b82f6] border-none transition-all duration-200 font-[inherit] ${
                  (loading || !prompt.trim())
                    ? "cursor-not-allowed opacity-50 shadow-none"
                    : "cursor-pointer opacity-100 shadow-[0_4px_24px_var(--border)]"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Generate Website
                  </>
                )}
              </motion.button>
            </motion.div>

            <p className="text-center text-[11px] mt-3 text-[var(--text-muted)]">
              Be as descriptive as possible for best results
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Generate;
