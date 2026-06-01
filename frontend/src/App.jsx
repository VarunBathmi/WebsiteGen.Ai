import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import useGetCurrentUser from "./hooks/useGetCurrentuser";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
// Add this import at the top:
import LiveSite from "./pages/LiveSite";

// Add this route inside your <Routes> — NO auth protection, it's public:
<Route path="/site/:slug" element={<LiveSite />} />;
// Lazy-load heavier pages for better initial load
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Generate = lazy(() => import("./pages/Generate"));
const WebsiteEditor = lazy(() => import("./pages/WebsiteEditor"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Settings = lazy(() => import("./pages/Settings"));

export const serverUrl = "http://localhost:8000";

const PageLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-base)]">
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[var(--bg-card)]"
          style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  </div>
);

const App = () => {
  useGetCurrentUser();
  const { userData } = useSelector((state) => state.user);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={userData ? <Dashboard /> : <Home />}
            />
            <Route
              path="/generate"
              element={userData ? <Generate /> : <Home />}
            />
            <Route
              path="/editor/:id"
              element={userData ? <WebsiteEditor /> : <Home />}
            />
            {/* ── New routes ── */}
            <Route
              path="/profile"
              element={userData ? <ProfilePage /> : <Home />}
            />
            <Route
              path="/edit-profile"
              element={userData ? <EditProfile /> : <Home />}
            />
            <Route
              path="/settings"
              element={userData ? <Settings /> : <Home />}
            />

            {/* Redirect any other unmatched paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/site/:slug" element={<LiveSite />} />
          </Routes>
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
