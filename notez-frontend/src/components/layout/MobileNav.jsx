import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiHome, HiSearch, HiUpload, HiUser } from "react-icons/hi";
import { HiTrophy } from "react-icons/hi2";

export default function MobileNav() {
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/10 bg-surface/80 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:hidden">
      {[
        { to: "/",           icon: HiHome,    label: "Home" },
        { to: "/browse",     icon: HiSearch,  label: "Browse" },
        { to: "/upload",     icon: HiUpload,  label: "Upload", auth: true },
        { to: "/leaderboard",icon: HiTrophy,  label: "XP" },
        { to: user ? "/profile" : "/login", icon: HiUser, label: user ? "Me" : "Login" },
      ].map(({ to, icon: Icon, label, auth }) => {
        if (auth && !user) return null;
        return (
          <NavLink key={to} to={to} end={to === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-semibold transition-colors ${
                isActive ? "text-cyan-200" : "text-slate-500 hover:text-slate-200"
              }`
            }
          >
            <Icon className="text-xl" />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
