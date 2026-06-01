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
          <p
            style={{
              fontSize: 13,
              marginBottom: 10,
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            Delete "{website.title}"?
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                padding: "5px 12px",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onDelete(website._id);
              }}
              style={{
                padding: "5px 12px",
                fontSize: 12,
                borderRadius: 8,
                border: "none",
                background: "#dc2626",
                color: "#fff",
                cursor: "pointer",
              }}
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
      style={{ position: "relative" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{ ...S.iconBtn, opacity: 1 }}
      >
        <MoreHorizontal size={14} color="var(--text-secondary)" />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 28,
            zIndex: 100,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "4px",
            minWidth: 160,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <button onClick={handleShare} style={S.menuItem}>
            <Share2 size={13} /> Share link
          </button>
          <div
            style={{ height: 1, background: "var(--border)", margin: "3px 0" }}
          />
          <button
            onClick={handleDelete}
            style={{ ...S.menuItem, color: "#f87171" }}
          >
            <Trash2 size={13} /> Delete project
          </button>
        </div>
      )}
    </div>
  );
};

// ── Single project row ───────────────────────────────────
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
      style={{
        ...S.projectCard,
        background: hovered ? "var(--bg-card-hover)" : "transparent",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 6,
          flexShrink: 0,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        {getEmoji(website.title)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 2,
          }}
        >
          {website.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
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
    <div
      style={{
        width: 260,
        height: "100%",
        background: "var(--bg-elevated)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "14px 14px 10px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
            }}
          >
            ✦ WebGen.ai
          </span>
          <button onClick={onClose} title="Collapse sidebar" style={S.iconBtn}>
            <PanelLeftClose size={15} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Search */}
        <div style={S.searchBar}>
          <Search
            size={13}
            color="var(--text-muted)"
            style={{ flexShrink: 0 }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={S.searchInput}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                padding: 0,
              }}
            >
              <X size={12} color="var(--text-muted)" />
            </button>
          )}
        </div>
      </div>

      {/* ── Nav ── */}
      <div style={{ padding: "8px 8px 4px" }}>
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
              style={{
                ...S.navItem,
                background:
                  activeNav === key ? "var(--bg-card-hover)" : "transparent",
                color:
                  activeNav === key
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              <Icon size={14} />
              <span style={{ flex: 1 }}>{label}</span>
              {count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    background: "var(--bg-card)",
                    padding: "1px 6px",
                    borderRadius: 10,
                  }}
                >
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={S.divider} />
      <div style={S.sectionLabel}>
        {activeNav === "starred"
          ? "Starred"
          : activeNav === "published"
            ? "Published"
            : "Recent"}
      </div>

      {/* ── Project list ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
        {/* Shimmer loading */}
        {loadingWebsites &&
          [1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 8px",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  background: "var(--bg-card-hover)",
                  flexShrink: 0,
                  animation: "sbpulse 1.5s ease-in-out infinite",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 12,
                    borderRadius: 4,
                    background: "var(--bg-card-hover)",
                    marginBottom: 6,
                    width: "70%",
                    animation: "sbpulse 1.5s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    height: 10,
                    borderRadius: 4,
                    background: "var(--bg-card-hover)",
                    width: "50%",
                    animation: "sbpulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          ))}

        {/* Empty states */}
        {!loadingWebsites && visibleWebsites.length === 0 && (
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              padding: "16px 8px",
              textAlign: "center",
              lineHeight: 1.7,
            }}
          >
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
            <div style={{ ...S.divider, margin: "8px 0" }} />
            <div style={S.sectionLabel}>Prompt ideas</div>
            {PROMPT_IDEAS.map((p, i) => (
              <div
                key={i}
                onClick={() => {
                  onPromptSelect?.(p.prompt);
                  onClose?.();
                  navigate("/generate");
                }}
                style={S.projectCard}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-card-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 6,
                    background: p.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {p.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: p.color,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: 2,
                      fontWeight: 500,
                    }}
                  >
                    {p.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.sub}
                  </div>
                </div>
                <ChevronRight
                  size={12}
                  color="var(--text-muted)"
                  style={{ flexShrink: 0, opacity: 0.4 }}
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Footer / Profile ── */}
      <div
        style={{ borderTop: "1px solid var(--border)", padding: "10px 8px" }}
      >
        <div
          onClick={() => navigate("/profile")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "6px 8px",
            borderRadius: 7,
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-card-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <span
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userData?.name || "User"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Shared styles ────────────────────────────────────────
const S = {
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "7px 10px",
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: 13,
    color: "var(--text-primary)",
    width: "100%",
    fontFamily: "inherit",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "7px 10px",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
    transition: "background 0.12s, color 0.12s",
    userSelect: "none",
  },
  divider: { height: 1, background: "var(--border)", margin: "4px 8px" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    padding: "8px 16px 4px",
  },
  projectCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 8px",
    borderRadius: 8,
    transition: "background 0.12s",
    cursor: "pointer",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
    color: "var(--text-primary)",
    background: "none",
    border: "none",
    width: "100%",
    fontFamily: "inherit",
    textAlign: "left",
  },
};

export default Sidebar;
