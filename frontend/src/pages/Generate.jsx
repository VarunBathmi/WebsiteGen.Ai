

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
        { withCredentials: true }
      );
      navigate(`/editor/${data.websiteId}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Generation failed. Please try again.");
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
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "var(--bg-base)",
      color: "var(--text-primary)",
    }}>
      <style>{`@keyframes sbpulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>

      {/* ── Desktop sidebar ── */}
      {!sidebarCollapsed && (
        <div className="hidden md:flex" style={{ height: "100vh", flexShrink: 0 }}>
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
        <div
          className="hidden md:flex"
          style={{
            width: 44, height: "100vh", flexShrink: 0,
            background: "var(--bg-elevated)",
            borderRight: "1px solid var(--border)",
            flexDirection: "column", alignItems: "center", paddingTop: 14,
          }}
        >
          <button
            onClick={() => setSidebarCollapsed(false)}
            title="Open sidebar"
            style={{
              width: 28, height: 28, borderRadius: 6, border: "none",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile slide-in ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -270 }} animate={{ x: 0 }} exit={{ x: -270 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{ position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50, height: "100vh" }}
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
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        overflow: "hidden", minWidth: 0,
      }}>

        {/* ── Header ── */}
        <header
          className="sticky top-0 z-30 shrink-0"
          style={{
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
            {/* Left — mobile hamburger */}
            <div className="flex items-center">
              <button
                className="flex md:hidden p-2 rounded-lg"
                style={{ color: "var(--text-secondary)" }}
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
              <div className="hidden sm:block w-px h-5" style={{ background: "var(--border)" }} />
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1.5 p-2 rounded-lg transition-all"
                style={{ color: "var(--text-secondary)" }}
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Main — fills remaining height, content centered inside ── */}
        <main style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "16px 20px" }}>

            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              style={{ textAlign: "center", marginBottom: 24 }}
            >
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginBottom: 14, padding: "5px 14px", borderRadius: 999,
                  fontSize: 11, fontWeight: 500,
                  background: "rgba(168,85,247,0.1)",
                  border: "1px solid rgba(168,85,247,0.25)",
                  color: "#c084fc",
                }}
              >
                <Sparkles size={11} /> Real AI Power
              </div>

              <h1 style={{
                fontSize: "clamp(24px, 4vw, 42px)",
                fontWeight: 700, letterSpacing: "-0.5px",
                lineHeight: 1.15, marginBottom: 10,
                color: "var(--text-primary)",
              }}>
                Build Website with{" "}
                <span style={{
                  background: "linear-gradient(135deg, #f0f0f0, #a1a1aa)",
                  WebkitBackgroundClip: "text", backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Real AI Power
                </span>
              </h1>

              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
                This process may take a few minutes. WebGen.ai focuses on quality, not shortcuts.
              </p>
            </motion.div>

            {/* Prompt box */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ marginBottom: 16 }}
            >
              <label
                htmlFor="prompt"
                style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--text-primary)" }}
              >
                Describe your website
              </label>

              <div style={{
                borderRadius: 16, background: "var(--bg-card)",
                border: "1px solid var(--border)", overflow: "hidden",
              }}>
                <textarea
                  id="prompt"
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. A modern SaaS landing page for a project management tool with dark theme, animated hero section, pricing table, and testimonials..."
                  disabled={loading}
                  rows={4}
                  style={{
                    width: "100%", padding: "14px 18px",
                    background: "transparent", border: "none", outline: "none",
                    resize: "none", fontSize: 13, lineHeight: 1.65,
                    color: "var(--text-primary)", fontFamily: "inherit",
                    // Key fix: no min-height, grows naturally
                    minHeight: 0,
                    maxHeight: "30vh",
                    overflowY: "auto",
                    boxSizing: "border-box",
                    opacity: loading ? 0.5 : 1,
                  }}
                />
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 18px",
                  borderTop: "1px solid var(--border)",
                }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {prompt.length > 0 ? `${prompt.length} chars` : ""}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {typeof navigator !== "undefined" && navigator?.platform?.toLowerCase().includes("mac") ? "⌘" : "Ctrl"}+Enter to generate
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: 13, color: "#f87171", textAlign: "center", marginBottom: 12 }}
              >
                {error}
              </motion.p>
            )}

            {/* Generate button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.18 }}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <motion.button
                whileHover={!loading ? { scale: 1.04 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "13px 36px", borderRadius: 16,
                  fontWeight: 600, fontSize: 14, color: "#000",
                  background: "linear-gradient(135deg, #e2e8f0, #ffffff)",
                  boxShadow: loading ? "none" : "0 4px 24px var(--border)",
                  border: "none", cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !prompt.trim() ? 0.5 : 1,
                  transition: "all 0.2s", fontFamily: "inherit",
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Generating…
                  </>
                ) : (
                  <><Sparkles size={15} /> Generate Website</>
                )}
              </motion.button>
            </motion.div>

            <p style={{ textAlign: "center", fontSize: 11, marginTop: 12, color: "var(--text-muted)" }}>
              Be as descriptive as possible for best results
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Generate;