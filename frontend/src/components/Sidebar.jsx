import React, { useState } from "react";
import {
  Search,
  LayoutDashboard,
  Star,
  Globe,
  MoreHorizontal,
  X,
  ChevronRight,
  Share2,
  Trash2,
  PanelLeftClose,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../App";

const PROMPT_IDEAS = [
  {
    emoji: "🚀",
    label: "SaaS landing page",
    sub: "hero · features · pricing",
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.15)",
    prompt:
      "Build a modern SaaS landing page with hero section, feature highlights, pricing table and testimonials with dark theme",
  },
  {
    emoji: "🎨",
    label: "Dev portfolio",
    sub: "dark · animated · showcase",
    color: "#2dd4bf",
    bg: "rgba(20,184,166,0.15)",
    prompt:
      "Create a personal developer portfolio with dark theme, smooth animations, project showcase and contact section",
  },
  {
    emoji: "🏢",
    label: "Creative agency",
    sub: "bold · services · contact",
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.15)",
    prompt:
      "Make a creative agency website with bold typography, services section, team cards and a contact form",
  },
  {
    emoji: "🛍️",
    label: "E-commerce store",
    sub: "products · cart · minimal",
    color: "#f87171",
    bg: "rgba(239,68,68,0.15)",
    prompt:
      "Design a clean e-commerce store homepage with product grid, featured items, cart button and footer",
  },
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "All projects", key: "all" },
  { icon: Star, label: "Starred", key: "starred" },
  { icon: Globe, label: "Published", key: "published" },
];

// ── Time ago helper ──────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

// ── Emoji from title ─────────────────────────────────────
const getEmoji = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("shop") || t.includes("store") || t.includes("ecommerce"))
    return "🛍️";
  if (t.includes("portfolio") || t.includes("personal")) return "🎨";
  if (t.includes("restaurant") || t.includes("food") || t.includes("cafe"))
    return "🍜";
  if (t.includes("agency") || t.includes("studio")) return "🏢";
  if (t.includes("saas") || t.includes("app") || t.includes("tool"))
    return "🚀";
  if (t.includes("blog") || t.includes("news")) return "📝";
  return "🌐";
};

// ── Three-dot menu ───────────────────────────────────────
const CardMenu = ({ website, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleShare = (e) => {
    e.stopPropagation();
    setOpen(false);
    if (website.deployUrl) {
      navigator.clipboard.writeText(website.deployUrl);
      toast.success("Link copied!");
    } else {
      toast.error("Deploy first to get a share link.");
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setOpen(false);
    toast(
      (t) => (
        <div>
          <p className="text-[13px] mb-2.5 font-medium text-[var(--text-primary)]">
            Delete "{website.title}"?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.25 text-[12px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onDelete(website._id);
              }}
              className="px-3 py-1.25 text-[12px] rounded-lg border-none bg-[#dc2626] text-white cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 6000, id: `delete-sidebar-${website._id}` },
    );
  };

  return (
    <div
      ref={menuRef}
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-7 h-7 rounded-[6px] border-none bg-transparent cursor-pointer flex items-center justify-center opacity-100"
      >
        <MoreHorizontal size={14} color="var(--text-secondary)" />
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-[100] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[10px] p-1 min-w-[160px] shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-[10px] py-[7px] rounded-[7px] cursor-pointer text-[13px] text-[var(--text-primary)] bg-transparent border-none w-full font-[inherit] text-left hover:bg-[var(--bg-card-hover)]"
          >
            <Share2 size={13} /> Share link
          </button>
          <div className="h-px bg-[var(--border)] my-[3px]" />
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-[10px] py-[7px] rounded-[7px] cursor-pointer text-[13px] text-[#f87171] bg-transparent border-none w-full font-[inherit] text-left hover:bg-red-500/10"
          >
            <Trash2 size={13} /> Delete project
          </button>
        </div>
      )}
    </div>
  );
};

// ── Single project row ──────────────────────────────────────
const ProjectRow = ({ website, onDelete, onClose, navigate }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => {
        onClose?.();
        navigate(`/editor/${website._id}`);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-center gap-2.5 px-2 py-[9px] rounded-lg transition-[background] duration-[120ms] cursor-pointer ${
        hovered ? "bg-[var(--bg-card-hover)]" : "bg-transparent"
      }`}
    >
      <div className="w-[34px] h-[34px] rounded-[6px] shrink-0 bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[16px]">
        {getEmoji(website.title)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-[var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis mb-0.5">
          {website.title}
        </div>
        <div className="text-[11px] text-[var(--text-muted)] whitespace-nowrap overflow-hidden text-ellipsis">
          {website.deployed ? "🟢 Live · " : ""}
          {timeAgo(website.updatedAt)}
        </div>
      </div>

      {hovered && <CardMenu website={website} onDelete={onDelete} />}
    </div>
  );
};

// ── Main Sidebar ─────────────────────────────────────────
const Sidebar = ({
  onPromptSelect,
  onClose,
  isMobile,
  websites,
  loadingWebsites,
  onWebsiteDeleted,
  isCollapsed,
  onOpen,
}) => {
  const navigate = useNavigate();
  const { userData } = useSelector((s) => s.user);
  const [activeNav, setActiveNav] = useState("all");
  const [search, setSearch] = useState("");

  const initials = userData?.name
    ? userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const visibleWebsites = websites
    .filter((w) => {
      if (activeNav === "starred") return w.starred;
      if (activeNav === "published") return w.deployed;
      return true;
    })
    .filter((w) => w.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${serverUrl}/api/website/delete/${id}`, {
        withCredentials: true,
      });
      onWebsiteDeleted(id);
      toast.success("Website deleted.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="w-[260px] h-full bg-[var(--bg-elevated)] border-r border-[var(--border)] flex flex-col shrink-0">
      {/* ── Header ── */}
      <div className="px-3.5 pt-3.5 pb-2.5 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-bold text-[var(--text-primary)] tracking-[-0.3px]">
            ✦ WebGen.ai
          </span>
          <button
            onClick={onClose}
            title="Collapse sidebar"
            className="w-7 h-7 rounded-[6px] border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            <PanelLeftClose size={15} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-[10px] py-[7px]">
          <Search size={13} color="var(--text-muted)" className="shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="bg-none border-none outline-none text-[13px] text-[var(--text-primary)] w-full font-[inherit] focus:outline-none focus:ring-0"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="background-none border-none cursor-pointer flex p-0"
            >
              <X size={12} color="var(--text-muted)" />
            </button>
          )}
        </div>
      </div>

      {/* ── Nav ── */}
      <div className="px-2 pt-2 pb-1">
        {NAV_ITEMS.map(({ icon: Icon, label, key }) => {
          const count =
            key === "starred"
              ? websites.filter((w) => w.starred).length
              : key === "published"
                ? websites.filter((w) => w.deployed).length
                : websites.length;

          return (
            <div
              key={key}
              onClick={() => setActiveNav(key)}
              className={`flex items-center gap-[9px] px-[10px] py-[7px] rounded-[7px] cursor-pointer text-[13px] transition-[background,color] duration-[120ms] select-none ${
                activeNav === key
                  ? "bg-[var(--bg-card-hover)] text-[var(--text-primary)]"
                  : "bg-transparent text-[var(--text-secondary)]"
              }`}
            >
              <Icon size={14} />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-card)] px-1.5 py-0.5 rounded-[10px]">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-px bg-[var(--border)] mx-2 my-1" />
      <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.6px] px-4 pt-2 pb-1">
        {activeNav === "starred"
          ? "Starred"
          : activeNav === "published"
            ? "Published"
            : "Recent"}
      </div>

      {/* ── Project list ── */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {/* Shimmer loading */}
        {loadingWebsites &&
          [1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2.5 px-2 py-[9px]">
              <div className="w-[34px] h-[34px] rounded-[6px] bg-[var(--bg-card-hover)] shrink-0 animate-[sbpulse_1.5s_ease-in-out_infinite]" />
              <div className="flex-1">
                <div className="h-3 rounded-[4px] bg-[var(--bg-card-hover)] mb-1.5 w-[70%] animate-[sbpulse_1.5s_ease-in-out_infinite]" />
                <div className="h-2.5 rounded-[4px] bg-[var(--bg-card-hover)] w-[50%] animate-[sbpulse_1.5s_ease-in-out_infinite]" />
              </div>
            </div>
          ))}

        {/* Empty states */}
        {!loadingWebsites && visibleWebsites.length === 0 && (
          <p className="text-[12px] text-[var(--text-muted)] px-2 py-4 text-center leading-[1.7]">
            {search
              ? "No projects match your search."
              : activeNav === "starred"
                ? "No starred projects yet.\nStar a project from Dashboard."
                : activeNav === "published"
                  ? "No published projects yet.\nDeploy one from Dashboard."
                  : "No websites yet.\nGenerate your first one!"}
          </p>
        )}

        {/* Rows */}
        {!loadingWebsites &&
          visibleWebsites.map((w) => (
            <ProjectRow
              key={w._id}
              website={w}
              onDelete={handleDelete}
              onClose={onClose}
              navigate={navigate}
            />
          ))}

        {/* Prompt ideas */}
        {activeNav === "all" && !search && (
          <>
            <div className="h-px bg-[var(--border)] my-2" />
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.6px] px-4 pt-2 pb-1">
              Prompt ideas
            </div>
            {PROMPT_IDEAS.map((p, i) => (
              <div
                key={i}
                onClick={() => {
                  onPromptSelect?.(p.prompt);
                  onClose?.();
                  navigate("/generate");
                }}
                className="flex items-center gap-2.5 px-2 py-[9px] rounded-lg transition-[background] duration-[120ms] cursor-pointer bg-transparent hover:bg-[var(--bg-card-hover)]"
              >
                <div
                  className="w-[34px] h-[34px] rounded-[6px] flex items-center justify-center text-[16px] shrink-0"
                  style={{ background: p.bg }}
                >
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] whitespace-nowrap overflow-hidden text-ellipsis mb-0.5 font-medium"
                    style={{ color: p.color }}
                  >
                    {p.label}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] whitespace-nowrap overflow-hidden text-ellipsis">
                    {p.sub}
                  </div>
                </div>
                <ChevronRight
                  size={12}
                  color="var(--text-muted)"
                  className="shrink-0 opacity-40"
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Footer / Profile ── */}
      <div className="border-t border-[var(--border)] px-2 py-2.5">
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 px-2 py-1.5 rounded-[7px] cursor-pointer bg-transparent hover:bg-[var(--bg-card-hover)]"
        >
          <div className="w-7 h-7 rounded-full bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {initials}
          </div>
          <span className="text-[13px] text-[var(--text-secondary)] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {userData?.name || "User"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
