import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import useGetCurrentUser from "./hooks/useGetCurrentuser";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import LiveSite from "./pages/LiveSite";

// Lazy-load heavier pages for better initial load performance
const Dashboard     = lazy(() => import("./pages/Dashboard"));
const Generate      = lazy(() => import("./pages/Generate"));
const WebsiteEditor = lazy(() => import("./pages/WebsiteEditor"));
const ProfilePage   = lazy(() => import("./pages/ProfilePage"));
const EditProfile   = lazy(() => import("./pages/EditProfile"));
const Settings      = lazy(() => import("./pages/Settings"));

// API base URL — set VITE_API_URL in .env for production
export const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

// Blocks protected routes until /api/user/me resolves — prevents route flicker
const ProtectedRoute = ({ children }) => {
  const { userData, authLoading } = useSelector((state) => state.user);
  if (authLoading) return <PageLoader />;
  return userData ? children : <Navigate to="/" replace />;
};

const App = () => {
  useGetCurrentUser();

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"           element={<Home />} />
            <Route path="/site/:slug" element={<LiveSite />} />

            {/* Protected */}
            <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/generate"     element={<ProtectedRoute><Generate /></ProtectedRoute>} />
            <Route path="/editor/:id"   element={<ProtectedRoute><WebsiteEditor /></ProtectedRoute>} />
            <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
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
