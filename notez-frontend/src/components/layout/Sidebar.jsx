import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import XPBar from "../xp/XPBar";
import {
  HiHome, HiSearch, HiUpload, HiBookmark,
   HiClock, HiUser, HiLogout, HiDocumentText
} from "react-icons/hi";
import { HiTrophy } from "react-icons/hi2";

const nav = [
  { to: "/",           label: "Home",        icon: HiHome },
  { to: "/browse",     label: "Browse",      icon: HiSearch },
  { to: "/upload",     label: "Upload",      icon: HiUpload, auth: true },
  { to: "/my-notes",   label: "My Notes",    icon: HiDocumentText, auth: true },
  { to: "/bookmarks",  label: "Bookmarks",   icon: HiBookmark, auth: true },
  { to: "/leaderboard",label: "Leaderboard", icon: HiTrophy },
  { to: "/focus",      label: "Focus Mode",  icon: HiClock, auth: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-30 h-screen w-72 flex-col border-r border-white/10 bg-surface/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
      <Link to="/" className="mb-8 flex items-center gap-3">
        <span className="brand-mark">Nz</span>
        <span>
          <span className="block font-display text-2xl font-bold text-white">Notez</span>
          <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/50">Study OS</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1.5">
        {nav.map(({ to, label, icon: Icon, auth }) => {
          if (auth && !user) return null;
          return (
            <NavLink
              key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all duration-200 ${
                  isActive
                    ? "border border-cyan-300/20 bg-white/[0.09] text-white shadow-lg shadow-cyan-950/20"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
                }`
              }
            >
              <Icon className="text-lg flex-shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {user ? (
        <div className="space-y-3 border-t border-white/10 pt-4">
          <XPBar xp={user.xp} level={user.level} />
          <Link to="/profile" className="flex items-center gap-3 px-2 transition-opacity hover:opacity-85">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-violet-400 to-rose-400 text-sm font-black text-slate-950">
              {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full rounded-2xl object-cover" /> : user.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.xp} XP / Level {user.level}</p>
            </div>
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-2 px-2 py-1 text-sm text-slate-500 transition-colors hover:text-rose-300">
            <HiLogout /> Logout
          </button>
        </div>
      ) : (
        <div className="space-y-2 border-t border-white/10 pt-4">
          <Link to="/login"    className="btn-primary block text-center text-sm py-2"><span>Login</span></Link>
          <Link to="/register" className="btn-ghost block text-center text-sm py-2">Sign Up</Link>
        </div>
      )}
    </aside>
  );
}
