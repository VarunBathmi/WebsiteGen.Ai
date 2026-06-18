import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CreditUsageBar = ({ compact = false }) => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [animated, setAnimated] = useState(false);
  const [prevCredits, setPrevCredits] = useState(null);
  const [flash, setFlash] = useState(false);

  const MAX_CREDITS = Math.max(userData?.credits ?? 100, 100);

  const remaining = userData?.credits ?? MAX_CREDITS;
  const used = MAX_CREDITS - remaining;
  const percentage = Math.min((remaining / MAX_CREDITS) * 100, 100);
  const isLow = percentage <= 25;
  const isCritical = percentage <= 10;

  // Flash animation when credits decrease
  useEffect(() => {
    if (prevCredits !== null && remaining < prevCredits) {
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
    }
    setPrevCredits(remaining);
  }, [remaining]);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const barClass = isCritical
    ? "bg-[linear-gradient(90deg,#ef4444,#f97316)]"
    : isLow
      ? "bg-[linear-gradient(90deg,#f97316,#eab308)]"
      : "bg-[linear-gradient(90deg,var(--accent),#3b82f6)]";

  const creditClass = isCritical
    ? "text-[#ef4444]"
    : isLow
      ? "text-[#f97316]"
      : "text-[var(--text-primary)]";

  // COMPACT — header pill
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-[background,border] duration-300 ${
          flash
            ? "bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.4)]"
            : "bg-[var(--bg-card)] border border-[var(--border)]"
        }`}
      >
        {/* Icon */}
        <motion.div
          animate={flash ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          {isCritical || isLow ? (
            <AlertTriangle size={12} color="#f97316" />
          ) : (
            <Zap size={12} className="text-[var(--accent)]" />
          )}
        </motion.div>

        {/* Bar */}
        <div className="rounded-full overflow-hidden w-[60px] h-[5px] bg-[var(--border)] shrink-0">
          <motion.div
            className={`h-full rounded-full ${barClass}`}
            animate={{ width: animated ? `${percentage}%` : "100%" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* Number */}
        <motion.span
          key={remaining}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className={`text-[11px] font-semibold tabular-nums min-w-6 ${creditClass}`}
        >
          {remaining}
          <span className="font-normal text-[10px] text-[var(--text-muted)]">
            /{MAX_CREDITS}
          </span>
        </motion.span>
      </motion.div>
    );
  }

  // FULL — dashboard sidebar or card
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`rounded-2xl p-4 transition-[background,border] duration-300 ${
        flash
          ? "bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.35)]"
          : "bg-[var(--bg-card)] border border-[var(--border)]"
      } ${
        isLow
          ? isCritical
            ? "shadow-[0_0_0_1px_rgba(239,68,68,0.3)]"
            : "shadow-[0_0_0_1px_rgba(249,115,22,0.25)]"
          : "shadow-none"
      }`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isLow ? "bg-[rgba(249,115,22,0.1)]" : "bg-[var(--accent-glow)]"
            }`}
          >
            {isLow ? (
              <AlertTriangle size={14} className="text-orange-400" />
            ) : (
              <Zap size={14} className="text-[var(--accent)]" />
            )}
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--text-primary)] leading-none">
              AI Credits
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              {isLow
                ? isCritical
                  ? "Critical — almost empty"
                  : "Running low"
                : "Usage this month"}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/settings?tab=billing")}
          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-150 bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent-glow)]"
        >
          <TrendingUp size={10} />
          Upgrade
        </button>
      </div>

      {/* Credit numbers */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <motion.span
            key={remaining}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`text-xl font-bold tabular-nums ${creditClass}`}
          >
            {remaining}
          </motion.span>
          <span className="text-[11px] text-[var(--text-muted)]">
            / {MAX_CREDITS} remaining
          </span>
        </div>
        <span className="text-[11px] font-medium tabular-nums text-[var(--text-muted)]">
          {used < 0 ? 0 : used} used
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className="h-2 w-full rounded-full overflow-hidden bg-[var(--border)]"
        role="progressbar"
        aria-valuenow={remaining}
        aria-valuemin={0}
        aria-valuemax={MAX_CREDITS}
      >
        <motion.div
          className={`h-full rounded-full ${barClass}`}
          animate={{ width: animated ? `${percentage}%` : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* Warning */}
      <AnimatePresence>
        {isLow && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-[10px] text-orange-400"
          >
            {isCritical
              ? "⚠ Less than 10% credits left. Upgrade to continue."
              : "Upgrade your plan for more credits."}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreditUsageBar;