import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Reusable input field — works for text, email, password.
 * Password fields get an automatic show/hide toggle.
 */
const InputField = ({
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  id,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div className="relative w-full group overflow-hidden rounded-xl">
      {/* Focus glow */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200"
        style={{
          background:
            "linear-gradient(135deg, rgba(168,85,247,0.07), rgba(59,130,246,0.07))",
          opacity: focused ? 1 : 0,
        }}
      />

      <input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full h-11 pl-4 pr-10 rounded-xl text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] appearance-none outline-none focus:outline-none focus:ring-0 transition-colors duration-150"
        // className="w-full h-11 pl-4 pr-10 rounded-xl text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] appearance-none focus:ring-0 focus:outline-none outline-none transition-colors duration-150"
        // style={{
        //   background: "var(--bg-card)",
        //   border: focused
        //     ? "1px solid rgba(168,85,247,0.5)"
        //     : "1px solid var(--border)",
        // }}
        style={{
          background: "var(--bg-card)",
          border: focused
            ? "1.5px solid var(--accent)"
            : "1px solid var(--border)",
          boxShadow: focused ? "0 0 0 3px var(--accent-glow)" : "none",
          transition: "border 0.15s, box-shadow 0.15s",
        }}
      />

      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={showPass ? "Hide password" : "Show password"}
          onClick={() => setShowPass((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
};

export default InputField;
