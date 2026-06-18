// ── Prevent theme flash on hard reload ───────────────────────────────────────
// Run synchronously before React paints so the correct class is set
// based on localStorage preference (system → matchMedia).
;(function () {
  try {
    const pref = localStorage.getItem("theme") || "dark";
    const isDark =
      pref === "dark" ||
      (pref === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  } catch (_) {}
})();

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/store.js";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
