

import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import {
  Code2,
  MessageSquare,
  Monitor,
  Rocket,
  Send,
  X,
  ArrowLeft,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Editor from "@monaco-editor/react";
import CreditUsageBar from "../components/CreditUsageBar";

/* ─── EditorHeader ─────────────────────────────────────── */
const EditorHeader = ({ title, onClose, onBack }) => (
  <div
    className="h-12 px-4 flex items-center justify-between shrink-0 border-b border-[var(--border)]"
  >
    <div className="flex items-center gap-2 overflow-hidden">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          className="p-1.5 rounded-lg shrink-0 transition-all text-[var(--text-secondary)]"
        >
          <ArrowLeft size={16} />
        </button>
      )}
      <span className="text-sm font-medium truncate text-[var(--text-primary)]">
        {title}
      </span>
    </div>
    {onClose && (
      <button
        onClick={onClose}
        aria-label="Close"
        className="p-1.5 rounded-lg shrink-0 transition-all text-[var(--text-secondary)]"
      >
        <X size={16} />
      </button>
    )}
  </div>
);

/* ─── ThinkingDots ─────────────────────────────────────── */
const ThinkingDots = () => (
  <span className="inline-flex gap-1 items-center">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-zinc-400"
        style={{ animation: `tpulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
      />
    ))}
    <style>{`@keyframes tpulse{0%,100%{opacity:.3;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}`}</style>
  </span>
);

/* ─── ChatPanel ────────────────────────────────────────── */
const ChatPanel = ({
  messages, prompt, setPrompt, handleUpdate,
  updateLoading, thinkingSteps, thinkingIndex, messagesEndRef,
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [prompt]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUpdate();
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <MessageSquare size={28} className="mb-3 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">
              Describe changes to update your website
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-white text-black"
                  : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {updateLoading && (
          <div className="flex justify-start">
            <div
              className="max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs italic flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]"
            >
              <ThinkingDots />
              <span>{thinkingSteps[thinkingIndex]}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 shrink-0 border-t border-[var(--border)]">
        <div
          className="flex gap-2 rounded-2xl p-2 bg-[var(--bg-card)] border border-[var(--border)]"
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            rows={1}
            disabled={updateLoading}
            placeholder="Describe changes… (Enter to send)"
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none disabled:opacity-50 text-[var(--text-primary)] max-h-[120px]"
          />
          <button
            onClick={handleUpdate}
            disabled={updateLoading || !prompt.trim()}
            aria-label="Send"
            className="shrink-0 self-end w-8 h-8 rounded-xl flex items-center justify-center text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Main WebsiteEditor ───────────────────────────────── */
const WebsiteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [website, setWebsite] = useState(null);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deployUrl, setDeployUrl] = useState("");

  const messagesEndRef = useRef(null);
  const iframeRef = useRef(null);

  const thinkingSteps = [
    "Analyzing your request…",
    "Writing the code…",
    "Applying changes…",
    "Almost done…",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, updateLoading]);

  useEffect(() => {
    if (!updateLoading) return;
    const iv = setInterval(
      () => setThinkingIndex((i) => (i + 1) % thinkingSteps.length),
      1300
    );
    return () => clearInterval(iv);
  }, [updateLoading]);

  /* Load website */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(
          `${serverUrl}/api/website/get-by-id/${id}`,
          { withCredentials: true }
        );
        setWebsite(data);
        setCode(data.latestCode ?? "");
        setMessages(data.conversation ?? []);
        setDeployUrl(data.deployUrl || "");
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load website.");
      }
    };
    load();
  }, [id]);

  /* Update iframe via blob URL — fixes white screen on internal links */
  useEffect(() => {
    if (!iframeRef.current || !code) return;
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [code]);

  const handleUpdate = useCallback(async () => {
    if (!prompt.trim() || updateLoading) return;
    const p = prompt.trim();
    setUpdateLoading(true);
    setMessages((m) => [...m, { role: "user", content: p }]);
    setPrompt("");
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/website/update/${id}`,
        { prompt: p },
        { withCredentials: true }
      );
      setMessages((m) => [...m, { role: "assistant", content: data.message }]);
      setCode(data.code);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setUpdateLoading(false);
    }
  }, [prompt, updateLoading, id]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const handleDeploy = async () => {
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/website/deploy/${id}`,
        {},
        { withCredentials: true }
      );
      setDeployUrl(data.url);
      window.open(data.url, "_blank");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyDeployLink = async () => {
    try {
      await navigator.clipboard.writeText(deployUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  /* Error */
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-base)]">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm underline text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  /* Loading */
  if (!website) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[var(--border)]"
              style={{
                animation: `ldpulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`@keyframes ldpulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
      </div>
    );
  }

  const chatProps = {
    messages, prompt, setPrompt, handleUpdate,
    updateLoading, thinkingSteps, thinkingIndex, messagesEndRef,
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[var(--bg-base)]">

      {/* ── Desktop chat sidebar ── */}
      <aside
        className="hidden lg:flex flex-col shrink-0 w-[clamp(280px,25vw,360px)] border-r border-[var(--border)]"
      >
        <EditorHeader title={website.title} onBack={() => navigate("/dashboard")} />
        <ChatPanel {...chatProps} />
      </aside>

      {/* ── Main preview area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Toolbar */}
        <div
          className="h-12 px-3 sm:px-4 flex items-center justify-between shrink-0 gap-2 border-b border-[var(--border)]"
        >
          {/* Left */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="lg:hidden p-1.5 rounded-lg shrink-0 transition-all text-[var(--text-secondary)]"
              onClick={() => navigate("/dashboard")}
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>

            <span
              className="text-xs font-medium tracking-wide uppercase hidden sm:block text-[var(--text-muted)]"
            >
              Live Preview
            </span>

            {/* New Website — desktop only, small pill style */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/generate")}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]"
            >
              <Plus size={12} /> New
            </motion.button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

            {/* Credit bar — desktop only */}
            <div className="hidden lg:block mr-1">
              <CreditUsageBar compact />
            </div>

            {/* Deploy / Share */}
            {!deployUrl ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDeploy}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold bg-gradient-to-br from-[#7c3aed] to-[#4f46e5]"
              >
                <Rocket size={12} />
                <span>Deploy</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyDeployLink}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
                  copiedLink
                    ? "bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.3)]"
                    : "bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none"
                }`}
              >
                {copiedLink ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> <span className="hidden sm:inline">Share</span></>}
              </motion.button>
            )}

            {/* Mobile chat toggle */}
            <button
              className="lg:hidden p-2 rounded-lg transition-all text-[var(--text-secondary)]"
              onClick={() => setShowChat(true)}
              aria-label="Open chat"
            >
              <MessageSquare size={16} />
            </button>

            {/* Code view */}
            <button
              className="p-2 rounded-lg transition-all text-[var(--text-secondary)]"
              onClick={() => setShowCode(true)}
              aria-label="View code"
            >
              <Code2 size={16} />
            </button>

            {/* Full preview */}
            <button
              className="p-2 rounded-lg transition-all text-[var(--text-secondary)]"
              onClick={() => setShowFullPreview(true)}
              aria-label="Full screen"
            >
              <Monitor size={16} />
            </button>
          </div>
        </div>

        {/* ── IFRAME — blob URL fixes white screen on internal nav ── */}
        <iframe
          ref={iframeRef}
          title="Website Preview"
          className="flex-1 w-full bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>

      {/* ── Mobile Chat Sheet ── */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[9999] flex flex-col bg-[var(--bg-base)]"
          >
            <EditorHeader title={website.title} onClose={() => setShowChat(false)} />
            <ChatPanel {...chatProps} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Code Drawer ── */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 right-0 w-full lg:w-[48%] z-[9999] flex flex-col bg-[var(--bg-elevated)]"
          >
            <div
              className="h-12 px-4 flex items-center justify-between shrink-0 border-b border-[var(--border)]"
            >
              <span className="text-sm font-medium text-[var(--text-primary)]">
                index.html
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all text-[var(--text-secondary)]"
                >
                  {copiedCode ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  {copiedCode ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => setShowCode(false)}
                  className="p-1.5 rounded-lg transition-all text-[var(--text-secondary)]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <Editor
                theme="vs-dark"
                value={code}
                language="html"
                onChange={(v) => setCode(v ?? "")}
                options={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                  fontLigatures: true,
                  smoothScrolling: true,
                  wordWrap: "on",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full Preview ── */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black"
          >
            {/* <iframe
              className="w-full h-full bg-white"
              srcDoc={code}
              title="Full Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            /> */}
            <iframe
  className="w-full h-full bg-white"
  src={URL.createObjectURL(
    new Blob([code], { type: "text/html" })
  )}
  title="Full Preview"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
/>
            {/* <button
              onClick={() => setShowFullPreview(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-xl text-white transition-all"
              style={{ background: "var(--bg-elevated)", backdropFilter: "blur(8px)" }}
            >
              <X size={18} />
            </button> */}

            <button
              onClick={() => setShowFullPreview(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-xl transition-all bg-[rgba(0,0,0,0.08)] text-[var(--text-primary)] border border-[var(--border)] backdrop-blur-[8px]"
            >
  <X size={18} />
</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WebsiteEditor;




// import axios from "axios";
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { serverUrl } from "../App";
// import {
//   Code2,
//   MessageSquare,
//   Monitor,
//   Rocket,
//   Send,
//   X,
//   ArrowLeft,
//   Copy,
//   Check,
//   Plus,
// } from "lucide-react";
// import { AnimatePresence, motion } from "motion/react";
// import Editor from "@monaco-editor/react";
// import CreditUsageBar from "../components/CreditUsageBar";
// /* ─── Sub-components ─────────────────────────────────────── */

// const EditorHeader = ({ title, onClose, onBack }) => (
//   <div
//     className="h-13 px-5 flex items-center justify-between shrink-0"
//     style={{ borderBottom: "1px solid var(--border)" }}
//   >
//     <div className="flex items-center gap-2 overflow-hidden">
//       {onBack && (
//         <button
//           onClick={onBack}
//           aria-label="Back to dashboard"
//           className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-150 shrink-0"
//         >
//           <ArrowLeft size={16} />
//         </button>
//       )}

//       <span className="text-sm font-medium truncate text-[var(--text-primary)]">
//         {title}
//       </span>
//     </div>

//     {onClose && (
//       <button
//         onClick={onClose}
//         aria-label="Close"
//         className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-150 shrink-0"
//       >
//         <X size={16} />
//       </button>
//     )}
//   </div>
// );

// const ThinkingDots = () => (
//   <span className="inline-flex gap-1 items-center">
//     {[0, 1, 2].map((i) => (
//       <span
//         key={i}
//         className="w-1.5 h-1.5 rounded-full bg-zinc-400"
//         style={{
//           animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
//         }}
//       />
//     ))}

//     <style>{`
//       @keyframes pulse {
//         0%,100% {
//           opacity:.3;
//           transform:scale(.7)
//         }
//         50% {
//           opacity:1;
//           transform:scale(1)
//         }
//       }
//     `}</style>
//   </span>
// );

// const ChatPanel = ({
//   messages,
//   prompt,
//   setPrompt,
//   handleUpdate,
//   updateLoading,
//   thinkingSteps,
//   thinkingIndex,
//   messagesEndRef,
// }) => {
//   const textareaRef = useRef(null);

//   /* Auto resize textarea */
//   useEffect(() => {
//     const el = textareaRef.current;
//     if (!el) return;

//     el.style.height = "auto";
//     el.style.height = Math.min(el.scrollHeight, 120) + "px";
//   }, [prompt]);

//   const onKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleUpdate();
//     }
//   };

//   return (
//     <>
//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
//         {messages.length === 0 && (
//           <div className="flex flex-col items-center justify-center h-full text-center py-10">
//             <MessageSquare size={28} className="text-zinc-700 mb-3" />

//             <p className="text-sm text-zinc-600">
//               Describe changes to update your website
//             </p>
//           </div>
//         )}

//         {messages.map((m, i) => (
//           <div
//             key={i}
//             className={`flex ${
//               m.role === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
//                 m.role === "user"
//                   ? "text-black"
//                   : "text-[var(--text-primary)]"
//               }`}
//               style={
//                 m.role === "user"
//                   ? {
//                       background: "#ffffff",
//                     }
//                   : {
//                       background: "var(--bg-card)",
//                       border: "1px solid var(--border)",
//                     }
//               }
//             >
//               {m.content}
//             </div>
//           </div>
//         ))}

//         {updateLoading && (
//           <div className="flex justify-start">
//             <div
//               className="max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs text-[var(--text-muted)] italic flex items-center gap-2"
//               style={{
//                 background: "var(--bg-card)",
//                 border: "1px solid var(--border)",
//               }}
//             >
//               <ThinkingDots />
//               <span>{thinkingSteps[thinkingIndex]}</span>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <div
//         className="p-3 shrink-0"
//         style={{ borderTop: "1px solid var(--border)" }}
//       >
//         <div
//           className="flex gap-2 rounded-2xl p-2"
//           style={{
//             background: "var(--bg-card)",
//             border: "1px solid var(--border)",
//           }}
//         >
//           <textarea
//             ref={textareaRef}
//             value={prompt}
//             rows={1}
//             disabled={updateLoading}
//             placeholder="Describe changes… (Enter to send)"
//             onChange={(e) => setPrompt(e.target.value)}
//             onKeyDown={onKeyDown}
//             className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white leading-relaxed placeholder:text-zinc-600 outline-none disabled:opacity-50"
//             style={{ maxHeight: "120px" }}
//           />

//           <button
//             onClick={handleUpdate}
//             disabled={updateLoading || !prompt.trim()}
//             aria-label="Send message"
//             className="shrink-0 self-end w-8 h-8 rounded-xl flex items-center justify-center text-black transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
//             style={{ background: "#ffffff" }}
//           >
//             <Send size={13} />
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// /* ─── Main Component ─────────────────────────────────────── */

// const WebsiteEditor = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [website, setWebsite] = useState(null);
//   const [error, setError] = useState("");
//   const [code, setCode] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [prompt, setPrompt] = useState("");

//   const [thinkingIndex, setThinkingIndex] = useState(0);
//   const [updateLoading, setUpdateLoading] = useState(false);

//   const [showFullPreview, setShowFullPreview] = useState(false);
//   const [showCode, setShowCode] = useState(false);
//   const [showChat, setShowChat] = useState(false);

//   const [copiedCode, setCopiedCode] = useState(false);
//   const [copiedLink, setCopiedLink] = useState(false);

//   const [deployUrl, setDeployUrl] = useState("");

//   const messagesEndRef = useRef(null);

//   const thinkingSteps = [
//     "Analyzing your request…",
//     "Writing the code…",
//     "Applying changes…",
//     "Almost done…",
//   ];

//   /* Scroll to latest message */
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({
//       behavior: "smooth",
//     });
//   }, [messages, updateLoading]);

//   /* Thinking text rotation */
//   useEffect(() => {
//     if (!updateLoading) return;

//     const iv = setInterval(() => {
//       setThinkingIndex((i) => (i + 1) % thinkingSteps.length);
//     }, 1300);

//     return () => clearInterval(iv);
//   }, [updateLoading]);

//   /* Load website */
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const { data } = await axios.get(
//           `${serverUrl}/api/website/get-by-id/${id}`,
//           {
//             withCredentials: true,
//           }
//         );

//         setWebsite(data);
//         setCode(data.latestCode ?? "");
//         setMessages(data.conversation ?? []);
//         setDeployUrl(data.deployUrl || "");
//       } catch (err) {
//         setError(
//           err?.response?.data?.message || "Failed to load website."
//         );
//       }
//     };

//     load();
//   }, [id]);

//   /* Update website */
//   const handleUpdate = useCallback(async () => {
//     if (!prompt.trim() || updateLoading) return;

//     const p = prompt.trim();

//     setUpdateLoading(true);

//     setMessages((m) => [
//       ...m,
//       {
//         role: "user",
//         content: p,
//       },
//     ]);

//     setPrompt("");

//     try {
//       const { data } = await axios.post(
//         `${serverUrl}/api/website/update/${id}`,
//         {
//           prompt: p,
//         },
//         {
//           withCredentials: true,
//         }
//       );

//       setMessages((m) => [
//         ...m,
//         {
//           role: "assistant",
//           content: data.message,
//         },
//       ]);

//       setCode(data.code);
//     } catch (err) {
//       setMessages((m) => [
//         ...m,
//         {
//           role: "assistant",
//           content: "Something went wrong. Please try again.",
//         },
//       ]);
//     } finally {
//       setUpdateLoading(false);
//     }
//   }, [prompt, updateLoading, id]);

//   /* Copy code */
//   const handleCopyCode = async () => {
//     try {
//       await navigator.clipboard.writeText(code);

//       setCopiedCode(true);

//       setTimeout(() => {
//         setCopiedCode(false);
//       }, 2000);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /* Deploy */
//   const handleDeploy = async () => {
//     try {
//       const { data } = await axios.post(
//         `${serverUrl}/api/website/deploy/${id}`,
//         {},
//         {
//           withCredentials: true,
//         }
//       );

//       setDeployUrl(data.url);

//       window.open(data.url, "_blank");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /* Copy deploy URL */
//   const handleCopyDeployLink = async () => {
//     try {
//       await navigator.clipboard.writeText(deployUrl);

//       setCopiedLink(true);

//       setTimeout(() => {
//         setCopiedLink(false);
//       }, 2000);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /* Error state */
//   if (error) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center gap-4">
//         <p className="text-red-400 text-sm">{error}</p>

//         <button
//           onClick={() => navigate("/dashboard")}
//           className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline"
//         >
//           Back to Dashboard
//         </button>
//       </div>
//     );
//   }

//   /* Loading state */
//   if (!website) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <div className="flex gap-1.5">
//           {[0, 1, 2].map((i) => (
//             <span
//               key={i}
//               className="w-2 h-2 rounded-full bg-[var(--bg-card)]"
//               style={{
//                 animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
//               }}
//             />
//           ))}

//           <style>{`
//             @keyframes pulse {
//               0%,100% {
//                 opacity:.2;
//                 transform:scale(.8)
//               }
//               50% {
//                 opacity:1;
//                 transform:scale(1)
//               }
//             }
//           `}</style>
//         </div>
//       </div>
//     );
//   }

//   const chatProps = {
//     messages,
//     prompt,
//     setPrompt,
//     handleUpdate,
//     updateLoading,
//     thinkingSteps,
//     thinkingIndex,
//     messagesEndRef,
//   };

//   return (
//     <div className="h-screen w-screen flex overflow-hidden">
//       {/* Sidebar */}
//       <aside
//         className="hidden lg:flex w-[340px] xl:w-[380px] flex-col shrink-0"
//         style={{
//           borderRight: "1px solid var(--border)",
//         }}
//       >
//         <EditorHeader
//           title={website.title}
//           onBack={() => navigate("/dashboard")}
//         />

//         <ChatPanel {...chatProps} />
//       </aside>

//       {/* Main */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Toolbar */}
//         <div
//           className="h-12 px-4 flex items-center justify-between shrink-0"
//           style={{
//             borderBottom: "1px solid var(--border)",
//           }}
//         >
//           {/* <div className="flex items-center gap-2">
//             <button
//               className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
//               onClick={() => navigate("/dashboard")}
//             >
//               <ArrowLeft size={16} />
//             </button>

//             <span className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">
//               Live Preview
//             </span>
//           </div> */}
//           <div className="flex items-center gap-2">
//   <button
//     className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
//     onClick={() => navigate("/dashboard")}
//   >
//     <ArrowLeft size={16} />
//   </button>

//   <span className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">
//     Live Preview
//   </span>

//   {/* ✅ NEW — Generate page button */}
//   <motion.button
//     whileHover={{ scale: 1.04 }}
//     whileTap={{ scale: 0.97 }}
//     onClick={() => navigate("/generate")}
//     className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
//     style={{
//       background: "linear-gradient(135deg, #6366f1, #a855f7)",
//     }}
//   >
//     <Plus size={13} /> New Website
//   </motion.button>
// </div>



//           <div className="flex items-center gap-1.5">

//             {/* ✅ Credit bar */}
//   <div className="hidden lg:block mr-1">
//     <CreditUsageBar compact />
//   </div>

//             {!deployUrl ? (
//               <motion.button
//                 whileHover={{ scale: 1.04 }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={handleDeploy}
//                 className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold"
//                 style={{
//                   background:
//                     "linear-gradient(135deg, #7c3aed, #4f46e5)",
//                 }}
//               >
//                 <Rocket size={12} />
//                 Deploy
//               </motion.button>
//             ) : (
//               <motion.button
//                 whileHover={{ scale: 1.04 }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={handleCopyDeployLink}
//                 className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold"
//                 style={{
//                   background: copiedLink
//                     ? "rgba(16,185,129,0.15)"
//                     : "linear-gradient(135deg, #10b981, #059669)",
//                   color: copiedLink ? "#34d399" : "#fff",
//                   border: copiedLink
//                     ? "1px solid rgba(52,211,153,0.3)"
//                     : "none",
//                 }}
//               >
//                 {copiedLink ? (
//                   <>
//                     <Check size={12} />
//                     Copied!
//                   </>
//                 ) : (
//                   <>
//                     <Copy size={12} />
//                     Share Link
//                   </>
//                 )}
//               </motion.button>
//             )}

//             {/* Mobile chat */}
//             <button
//               className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
//               onClick={() => setShowChat(true)}
//             >
//               <MessageSquare size={16} />
//             </button>

//             {/* Code */}
//             <button
//               className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
//               onClick={() => setShowCode(true)}
//             >
//               <Code2 size={16} />
//             </button>

//             {/* Full preview */}
//             <button
//               className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
//               onClick={() => setShowFullPreview(true)}
//             >
//               <Monitor size={16} />
//             </button>
//           </div>
//         </div>

//         {/* Preview iframe */}
//         <iframe
//           title="Website Preview"
//           className="flex-1 w-full bg-white"
//           srcDoc={code}
//           sandbox="allow-scripts"
//         />
//       </div>

//       {/* Mobile Chat */}
//       <AnimatePresence>
//         {showChat && (
//           <motion.div
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{
//               duration: 0.3,
//               ease: [0.4, 0, 0.2, 1],
//             }}
//             className="fixed inset-0 z-[9999] bg-[var(--bg-base)] flex flex-col"
//           >
//             <EditorHeader
//               title={website.title}
//               onClose={() => setShowChat(false)}
//             />

//             <ChatPanel {...chatProps} />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Code Drawer */}
//       <AnimatePresence>
//         {showCode && (
//           <motion.div
//             initial={{ x: "100%" }}
//             animate={{ x: 0 }}
//             exit={{ x: "100%" }}
//             transition={{
//               duration: 0.28,
//               ease: [0.4, 0, 0.2, 1],
//             }}
//             className="fixed inset-y-0 right-0 w-full lg:w-[48%] z-[9999] flex flex-col"
//             style={{
//               background: "var(--bg-elevated)",
//             }}
//           >
//             <div
//               className="h-12 px-4 flex items-center justify-between shrink-0"
//               style={{
//                 borderBottom: "1px solid var(--border)",
//               }}
//             >
//               <span className="text-sm font-medium text-[var(--text-primary)]">
//                 index.html
//               </span>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={handleCopyCode}
//                   className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
//                 >
//                   {copiedCode ? (
//                     <Check size={13} className="text-green-400" />
//                   ) : (
//                     <Copy size={13} />
//                   )}

//                   {copiedCode ? "Copied!" : "Copy"}
//                 </button>

//                 <button
//                   onClick={() => setShowCode(false)}
//                   className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             </div>

//             <div className="flex-1 overflow-hidden">
//               <Editor
//                 theme="vs-dark"
//                 value={code}
//                 language="html"
//                 onChange={(v) => setCode(v ?? "")}
//                 options={{
//                   fontSize: 13,
//                   lineHeight: 1.6,
//                   minimap: {
//                     enabled: false,
//                   },
//                   scrollBeyondLastLine: false,
//                   padding: {
//                     top: 12,
//                     bottom: 12,
//                   },
//                   fontFamily:
//                     "'Fira Code', 'Cascadia Code', monospace",
//                   fontLigatures: true,
//                   smoothScrolling: true,
//                 }}
//               />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Full Preview */}
//       <AnimatePresence>
//         {showFullPreview && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{
//               duration: 0.2,
//             }}
//             className="fixed inset-0 z-[9999] bg-black"
//           >
//             <iframe
//               className="w-full h-full bg-white"
//               srcDoc={code}
//               title="Full Preview"
//               sandbox="allow-scripts"
//             />

//             <button
//               onClick={() => setShowFullPreview(false)}
//               className="absolute top-4 right-4 p-2 rounded-xl text-white hover:bg-[var(--bg-card-hover)] transition-all"
//               style={{
//                 background: "var(--bg-elevated)",
//                 backdropFilter: "blur(8px)",
//               }}
//             >
//               <X size={18} />
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default WebsiteEditor;