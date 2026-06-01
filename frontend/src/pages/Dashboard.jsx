

import axios from "axios";
import { serverUrl } from "../App";
import {
  ArrowLeft, Check, Plus, Rocket, Share2,
  Sparkles, Star, Trash2, Zap, AlertTriangle,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CreditUsageBar from "../components/CreditUsageBar";

// ── Mobile-only mini credit pill (icon + number only, no bar) ──
const MiniCreditPill = () => {
  const { userData } = useSelector((s) => s.user);
  const MAX = Math.max(userData?.credits ?? 100, 100);
  const remaining = userData?.credits ?? MAX;
  const pct = Math.min((remaining / MAX) * 100, 100);
  const isLow = pct <= 25;
  const isCritical = pct <= 10;
  const color = isCritical ? "#ef4444" : isLow ? "#f97316" : "var(--text-primary)";
  const Icon = isLow ? AlertTriangle : Zap;
  const iconColor = isCritical ? "#ef4444" : isLow ? "#f97316" : "var(--accent, #6366f1)";

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "5px 10px", borderRadius: 10,
        background: "var(--bg-card)",
        border: `1px solid ${isCritical ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
        flexShrink: 0,
      }}
    >
      <Icon size={12} color={iconColor} />
      <span style={{ fontSize: 12, fontWeight: 600, color, tabularNums: true }}>
        {remaining}
      </span>
    </div>
  );
};

const Dashboard = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const goHome = useCallback(() => navigate("/"), [navigate]);
  const goGenerate = useCallback(() => navigate("/generate"), [navigate]);

  useEffect(() => {
    axios
      .get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
      .then(({ data }) => setWebsites(data || []))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load websites."))
      .finally(() => setLoading(false));
  }, []);

  const handleStar = async (e, id) => {
    e.stopPropagation();
    setWebsites((prev) => prev.map((w) => w._id === id ? { ...w, starred: !w.starred } : w));
    try {
      await axios.patch(`${serverUrl}/api/website/star/${id}`, {}, { withCredentials: true });
    } catch {
      setWebsites((prev) => prev.map((w) => w._id === id ? { ...w, starred: !w.starred } : w));
      toast.error("Could not update star.");
    }
  };

  const handleDeploy = async (e, id) => {
    e.stopPropagation();
    try {
      const { data } = await axios.post(`${serverUrl}/api/website/deploy/${id}`, {}, { withCredentials: true });
      window.open(data.url, "_blank");
      setWebsites((prev) => prev.map((w) => w._id === id ? { ...w, deployed: true, deployUrl: data.url } : w));
      toast.success("Website deployed!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Deploy failed.");
    }
  };

  const handleCopy = async (e, site) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(site.deployUrl);
      setCopiedId(site._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    toast(
      (t) => (
        <div>
          <p style={{ fontSize: 13, marginBottom: 10, fontWeight: 500, color: "var(--text-primary)" }}>
            Delete this website?
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{ padding: "5px 12px", fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", cursor: "pointer" }}
            >Cancel</button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await axios.delete(`${serverUrl}/api/website/delete/${id}`, { withCredentials: true });
                  setWebsites((prev) => prev.filter((w) => w._id !== id));
                  toast.success("Website deleted.");
                } catch (err) {
                  toast.error(err?.response?.data?.message || "Delete failed.");
                }
              }}
              style={{ padding: "5px 12px", fontSize: 12, borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" }}
            >Delete</button>
          </div>
        </div>
      ),
      { duration: 6000, id: `delete-${id}` }
    );
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      overflow: "hidden", background: "var(--bg-base)", color: "var(--text-primary)",
    }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 shrink-0"
        style={{
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-3">

          {/* Left */}
          <div className="flex items-center gap-2">
            <button
              onClick={goHome}
              className="p-2 rounded-lg transition-all"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Back to home"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-[15px] font-semibold">Dashboard</h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Desktop — full compact credit bar */}
            <div className="hidden sm:block">
              <CreditUsageBar compact />
            </div>

            {/* Mobile — mini pill: icon + number only */}
            <div className="sm:hidden">
              <MiniCreditPill />
            </div>

            {/* New Website button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={goGenerate}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-black text-xs sm:text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #e2e8f0, #fff)",
                boxShadow: "0 2px 12px var(--border)",
                whiteSpace: "nowrap",
              }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Website</span>
              <span className="sm:hidden">New</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── Scrollable main ── */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Welcome — no credit bar here anymore */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 sm:mb-12"
          >
            <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Welcome back</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{userData?.name}</h2>
          </motion.div>

          {loading && (
            <div className="flex items-center justify-center py-24 text-sm" style={{ color: "var(--text-muted)" }}>
              Loading your websites…
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center py-24 text-red-400 text-sm">{error}</div>
          )}

          {!loading && !error && websites.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center rounded-3xl"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px dashed var(--border)" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-purple-400"
                style={{ background: "rgba(168,85,247,0.1)" }}>
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">No websites yet</h3>
              <p className="text-sm mb-7 max-w-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Generate your first AI-powered website in minutes.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={goGenerate}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-black text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #e2e8f0, #fff)" }}
              >
                <Plus size={15} /> Create your first website
              </motion.button>
            </motion.div>
          )}

          {/* Cards */}
          {!loading && !error && websites.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {websites.map((w, i) => {
                const isCopied = copiedId === w._id;
                return (
                  <motion.div
                    key={w._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    {/* Preview */}
                    <div
                      className="relative h-40 sm:h-44 cursor-pointer overflow-hidden bg-black"
                      onClick={() => navigate(`/editor/${w._id}`)}
                    >
                      <iframe
                        srcDoc={w.latestCode}
                        title={w.title}
                        className="absolute inset-0 w-[142%] h-[142%] pointer-events-none bg-white"
                        style={{ transform: "scale(0.704)", transformOrigin: "top left" }}
                        sandbox="allow-scripts allow-same-origin"
                      />
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition" />
                    </div>

                    {/* Card body */}
                    <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
                      <h3
                        className="text-sm font-semibold line-clamp-1 cursor-pointer hover:text-purple-300 transition"
                        onClick={() => navigate(`/editor/${w._id}`)}
                      >
                        {w.title}
                      </h3>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(w.updatedAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleStar(e, w._id)}
                            className="p-1.5 rounded-md transition-all"
                            style={{
                              background: w.starred ? "rgba(250,204,21,0.15)" : "rgba(255,255,255,0.04)",
                              border: w.starred ? "1px solid rgba(250,204,21,0.4)" : "1px solid var(--border)",
                            }}
                            aria-label={w.starred ? "Unstar" : "Star"}
                          >
                            <Star size={14} fill={w.starred ? "#facc15" : "none"} color={w.starred ? "#facc15" : "#9ca3af"} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, w._id)}
                            className="p-1.5 rounded-md transition-all"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#f87171" }}
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {!w.deployed ? (
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={(e) => handleDeploy(e, w._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
                          >
                            <Rocket size={15} /> Deploy
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={(e) => handleCopy(e, w)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{
                              background: isCopied ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg, #10b981, #059669)",
                              color: isCopied ? "#34d399" : "#fff",
                              border: isCopied ? "1px solid rgba(52,211,153,0.3)" : "none",
                            }}
                          >
                            {isCopied ? <><Check size={14} /> Link Copied!</> : <><Share2 size={14} /> Share Link</>}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;


// import axios from "axios";
// import { serverUrl } from "../App";
// import {
//   ArrowLeft, Check, Plus, Rocket, Share2,
//   Sparkles, Star, Trash2,
// } from "lucide-react";
// import { motion } from "motion/react";
// import React, { useCallback, useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import CreditUsageBar from "../components/CreditUsageBar";

// const Dashboard = () => {
//   const { userData } = useSelector((state) => state.user);
//   const navigate = useNavigate();

//   const [websites, setWebsites] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [copiedId, setCopiedId] = useState(null);

//   const goHome = useCallback(() => navigate("/"), [navigate]);
//   const goGenerate = useCallback(() => navigate("/generate"), [navigate]);

//   useEffect(() => {
//     axios
//       .get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
//       .then(({ data }) => setWebsites(data || []))
//       .catch((err) => setError(err?.response?.data?.message || "Failed to load websites."))
//       .finally(() => setLoading(false));
//   }, []);

//   const handleStar = async (e, id) => {
//     e.stopPropagation();
//     setWebsites((prev) => prev.map((w) => w._id === id ? { ...w, starred: !w.starred } : w));
//     try {
//       await axios.patch(`${serverUrl}/api/website/star/${id}`, {}, { withCredentials: true });
//     } catch {
//       setWebsites((prev) => prev.map((w) => w._id === id ? { ...w, starred: !w.starred } : w));
//       toast.error("Could not update star.");
//     }
//   };

//   const handleDeploy = async (e, id) => {
//     e.stopPropagation();
//     try {
//       const { data } = await axios.post(`${serverUrl}/api/website/deploy/${id}`, {}, { withCredentials: true });
//       window.open(data.url, "_blank");
//       setWebsites((prev) => prev.map((w) => w._id === id ? { ...w, deployed: true, deployUrl: data.url } : w));
//       toast.success("Website deployed!");
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Deploy failed.");
//     }
//   };

//   const handleCopy = async (e, site) => {
//     e.stopPropagation();
//     try {
//       await navigator.clipboard.writeText(site.deployUrl);
//       setCopiedId(site._id);
//       setTimeout(() => setCopiedId(null), 2000);
//     } catch {
//       toast.error("Could not copy link.");
//     }
//   };

//   const handleDelete = (e, id) => {
//     e.stopPropagation();
//     toast(
//       (t) => (
//         <div>
//           <p style={{ fontSize: 13, marginBottom: 10, fontWeight: 500, color: "var(--text-primary)" }}>
//             Delete this website?
//           </p>
//           <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
//             <button
//               onClick={() => toast.dismiss(t.id)}
//               style={{ padding: "5px 12px", fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", cursor: "pointer" }}
//             >Cancel</button>
//             <button
//               onClick={async () => {
//                 toast.dismiss(t.id);
//                 try {
//                   await axios.delete(`${serverUrl}/api/website/delete/${id}`, { withCredentials: true });
//                   setWebsites((prev) => prev.filter((w) => w._id !== id));
//                   toast.success("Website deleted.");
//                 } catch (err) {
//                   toast.error(err?.response?.data?.message || "Delete failed.");
//                 }
//               }}
//               style={{ padding: "5px 12px", fontSize: 12, borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" }}
//             >Delete</button>
//           </div>
//         </div>
//       ),
//       { duration: 6000, id: `delete-${id}` }
//     );
//   };

//   return (
//     <div style={{
//       display: "flex", flexDirection: "column", height: "100vh",
//       overflow: "hidden", background: "var(--bg-base)", color: "var(--text-primary)",
//     }}>

//       {/* ── Header ── */}
//       <header
//         className="sticky top-0 z-40 shrink-0"
//         style={{
//           backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
//           background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)",
//         }}
//       >
//         <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-3">

//           {/* Left */}
//           <div className="flex items-center gap-2">
//             <button
//               onClick={goHome}
//               className="p-2 rounded-lg transition-all"
//               style={{ color: "var(--text-secondary)" }}
//               aria-label="Back to home"
//             >
//               <ArrowLeft size={16} />
//             </button>
//             <h1 className="text-[15px] font-semibold">Dashboard</h1>
//           </div>

//           {/* Right — Credit bar + New Website button */}
//           <div className="flex items-center gap-2 shrink-0">
//             {/* Credit bar */}
//             <div className="hidden sm:block">
//               <CreditUsageBar compact />
//             </div>

//             {/* New Website — right of credit bar */}
//             <motion.button
//               whileHover={{ scale: 1.04 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={goGenerate}
//               className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-black text-xs sm:text-sm font-semibold"
//               style={{
//                 background: "linear-gradient(135deg, #e2e8f0, #fff)",
//                 boxShadow: "0 2px 12px var(--border)",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               <Plus size={14} />
//               <span className="hidden sm:inline">New Website</span>
//               <span className="sm:hidden">New</span>
//             </motion.button>
//           </div>
//         </div>
//       </header>

//       {/* ── Scrollable main ── */}
//       <main style={{ flex: 1, overflowY: "auto" }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

//           {/* Welcome */}
//           <motion.div
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="mb-8 sm:mb-12"
//           >
//             {/* Mobile credit bar */}
//             <div className="sm:hidden mb-4">
//               <CreditUsageBar compact />
//             </div>
//             <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Welcome back</p>
//             <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{userData?.name}</h2>
//           </motion.div>

//           {loading && (
//             <div className="flex items-center justify-center py-24 text-sm" style={{ color: "var(--text-muted)" }}>
//               Loading your websites…
//             </div>
//           )}

//           {!loading && error && (
//             <div className="flex items-center justify-center py-24 text-red-400 text-sm">{error}</div>
//           )}

//           {!loading && !error && websites.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="flex flex-col items-center justify-center py-20 text-center rounded-3xl"
//               style={{ background: "rgba(255,255,255,0.025)", border: "1px dashed var(--border)" }}
//             >
//               <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-purple-400"
//                 style={{ background: "rgba(168,85,247,0.1)" }}>
//                 <Sparkles size={24} />
//               </div>
//               <h3 className="text-lg font-semibold mb-2">No websites yet</h3>
//               <p className="text-sm mb-7 max-w-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
//                 Generate your first AI-powered website in minutes.
//               </p>
//               <motion.button
//                 whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
//                 onClick={goGenerate}
//                 className="flex items-center gap-2 px-6 py-3 rounded-xl text-black text-sm font-semibold"
//                 style={{ background: "linear-gradient(135deg, #e2e8f0, #fff)" }}
//               >
//                 <Plus size={15} /> Create your first website
//               </motion.button>
//             </motion.div>
//           )}

//           {/* Cards */}
//           {!loading && !error && websites.length > 0 && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
//               {websites.map((w, i) => {
//                 const isCopied = copiedId === w._id;
//                 return (
//                   <motion.div
//                     key={w._id}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: i * 0.05 }}
//                     whileHover={{ y: -4 }}
//                     className="rounded-2xl overflow-hidden flex flex-col"
//                     style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
//                   >
//                     {/* Preview */}
//                     <div
//                       className="relative h-40 sm:h-44 cursor-pointer overflow-hidden bg-black"
//                       onClick={() => navigate(`/editor/${w._id}`)}
//                     >
//                       <iframe
//                         srcDoc={w.latestCode}
//                         title={w.title}
//                         className="absolute inset-0 w-[142%] h-[142%] pointer-events-none bg-white"
//                         style={{ transform: "scale(0.704)", transformOrigin: "top left" }}
//                         sandbox="allow-scripts allow-same-origin"
//                       />
//                       <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition" />
//                     </div>

//                     {/* Card body */}
//                     <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
//                       {/* Title */}
//                       <h3
//                         className="text-sm font-semibold line-clamp-1 cursor-pointer hover:text-purple-300 transition"
//                         onClick={() => navigate(`/editor/${w._id}`)}
//                       >
//                         {w.title}
//                       </h3>

//                       {/* Date + Star + Delete */}
//                       <div className="flex items-center justify-between gap-2">
//                         <p className="text-xs" style={{ color: "var(--text-muted)" }}>
//                           {new Date(w.updatedAt).toLocaleDateString()}
//                         </p>
//                         <div className="flex items-center gap-1.5">
//                           <button
//                             onClick={(e) => handleStar(e, w._id)}
//                             className="p-1.5 rounded-md transition-all"
//                             style={{
//                               background: w.starred ? "rgba(250,204,21,0.15)" : "rgba(255,255,255,0.04)",
//                               border: w.starred ? "1px solid rgba(250,204,21,0.4)" : "1px solid var(--border)",
//                             }}
//                             aria-label={w.starred ? "Unstar" : "Star"}
//                           >
//                             <Star size={14} fill={w.starred ? "#facc15" : "none"} color={w.starred ? "#facc15" : "#9ca3af"} />
//                           </button>
//                           <button
//                             onClick={(e) => handleDelete(e, w._id)}
//                             className="p-1.5 rounded-md transition-all"
//                             style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#f87171" }}
//                             aria-label="Delete"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </div>

//                       {/* Action */}
//                       <div className="mt-auto">
//                         {!w.deployed ? (
//                           <motion.button
//                             whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//                             onClick={(e) => handleDeploy(e, w._id)}
//                             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
//                             style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
//                           >
//                             <Rocket size={15} /> Deploy
//                           </motion.button>
//                         ) : (
//                           <motion.button
//                             whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//                             onClick={(e) => handleCopy(e, w)}
//                             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
//                             style={{
//                               background: isCopied ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg, #10b981, #059669)",
//                               color: isCopied ? "#34d399" : "#fff",
//                               border: isCopied ? "1px solid rgba(52,211,153,0.3)" : "none",
//                             }}
//                           >
//                             {isCopied ? <><Check size={14} /> Link Copied!</> : <><Share2 size={14} /> Share Link</>}
//                           </motion.button>
//                         )}
//                       </div>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;