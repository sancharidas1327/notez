import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import OfflineBanner from "./components/layout/OfflineBanner";

// Pages
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import NoteDetail from "./pages/NoteDetail";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import FocusMode from "./pages/FocusMode";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyNotes from "./pages/MyNotes";
import Bookmarks from "./pages/Bookmarks";
import NotFound from "./pages/NotFound";

// Protected route wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-ambient flex min-h-screen items-center justify-center"><span className="brand-mark animate-pulse">Nz</span></div>;
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <>
      <OfflineBanner />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App shell */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="browse"  element={<Browse />} />
          <Route path="notes/:id" element={<NoteDetail />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="users/:id" element={<Profile />} />

          {/* Protected */}
          <Route path="upload"    element={<PrivateRoute><Upload /></PrivateRoute>} />
          <Route path="my-notes"  element={<PrivateRoute><MyNotes /></PrivateRoute>} />
          <Route path="bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
          <Route path="focus"     element={<PrivateRoute><FocusMode /></PrivateRoute>} />
          <Route path="profile"   element={<PrivateRoute><Profile me /></PrivateRoute>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
