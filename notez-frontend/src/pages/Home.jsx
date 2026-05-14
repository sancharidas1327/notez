import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useOffline } from "../context/OfflineContext";
import { getAllCachedNotes } from "../services/offlineDB";
import NoteCard from "../components/notes/NoteCard";
import { HiArrowRight, HiUpload, HiClock, HiSparkles, HiDownload, HiLightningBolt } from "react-icons/hi";
import { HiTrophy } from "react-icons/hi2";

export default function Home() {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (isOnline) {
        try {
          const [t, r] = await Promise.all([
            api.get("/notes?sort=trending&limit=4"),
            api.get("/notes?sort=createdAt&limit=4"),
          ]);
          setTrending(t.data.notes);
          setRecent(r.data.notes);
        } catch {}
      } else {
        const cached = await getAllCachedNotes();
        setTrending(cached.slice(0, 4));
        setRecent(cached.slice(0, 4));
      }
      setLoading(false);
    };
    load();
  }, [isOnline]);

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] px-5 py-8 shadow-2xl shadow-black/30 backdrop-blur-2xl md:px-8 lg:px-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
        <div className="grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div>
            <span className="eyebrow"><HiSparkles /> Student-first knowledge network</span>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[0.96] text-white md:text-7xl">
              {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Notes that move with your campus"}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Discover high quality notes, build study streaks, and turn every helpful upload into XP inside a clean, fast study workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/browse" className="btn-primary flex items-center gap-2"><span>Browse Notes</span><HiArrowRight className="relative z-10" /></Link>
              {user
                ? <Link to="/upload" className="btn-ghost flex items-center gap-2"><HiUpload />Upload Note</Link>
                : <Link to="/register" className="btn-ghost flex items-center gap-2">Join Free</Link>
              }
            </div>
          </div>

          <div className="relative min-h-[340px]">
            <div className="absolute left-4 top-4 h-52 w-52 rounded-[2rem] border border-cyan-200/20 bg-cyan-200/10 blur-sm" />
            <div className="absolute bottom-2 right-3 h-56 w-56 rounded-[2rem] border border-rose-300/20 bg-rose-300/10 blur-sm" />
            <div className="glass-panel relative mx-auto flex min-h-[320px] max-w-sm flex-col justify-between p-5">
              <div className="flex items-center justify-between">
                <span className="brand-mark">Nz</span>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-100">Live</span>
              </div>
              <div className="space-y-3">
                <div className="motion-chip flex items-center justify-between">
                  <span>Daily login streak</span>
                  <span className="font-bold text-cyan-200">+10 XP</span>
                </div>
                <div className="motion-chip ml-8 flex items-center justify-between">
                  <span>New upload scored</span>
                  <span className="font-bold text-rose-200">+50 XP</span>
                </div>
                <div className="motion-chip mr-8 flex items-center justify-between">
                  <span>Cached for offline</span>
                  <span className="font-bold text-amber-200">Ready</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Uploads" value="50 XP" />
                <MiniStat label="Likes" value="5 XP" />
                <MiniStat label="Downloads" value="10 XP" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {user && (
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "Your XP", value: `${user.xp} pts`, icon: HiLightningBolt },
            { label: "Level", value: `Level ${user.level}`, icon: HiTrophy },
            { label: "Streak", value: `${user.streak ?? 0} days`, icon: HiClock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.08] text-cyan-200">
                <Icon className="text-xl" />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-white">{value}</div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { to:"/upload", icon:<HiUpload/>, label:"Upload", desc:"Publish clean notes and earn 50 XP" },
          { to:"/leaderboard", icon:<HiTrophy/>, label:"Leaderboard", desc:"See the strongest campus contributors" },
          { to:"/focus", icon:<HiClock/>, label:"Focus Mode", desc:"Start a polished Pomodoro session" },
        ].map(a => (
          <Link key={a.to} to={a.to} className="card group flex min-h-36 flex-col justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.08] text-2xl text-cyan-200 transition-transform group-hover:scale-105">{a.icon}</span>
            <span>
              <span className="block font-display text-lg font-bold text-white">{a.label}</span>
              <span className="mt-1 block text-sm text-slate-400">{a.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      <NoteSection title="Trending" to="/browse?sort=trending" loading={loading} notes={trending} />
      <NoteSection title="Recent Uploads" to="/browse" loading={loading} notes={recent} />
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-sm font-bold text-white">{value}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
    </div>
  );
}

function NoteSection({ title, to, loading, notes }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">{title}</h2>
        <Link to={to} className="text-sm font-semibold text-cyan-200 hover:text-white">See all</Link>
      </div>
      {loading ? <NoteSkeleton /> : notes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map(n => <NoteCard key={n._id} note={n} />)}
        </div>
      ) : (
        <div className="glass-panel p-8 text-center text-slate-400">
          No notes here yet. Upload the first one and make this space useful.
        </div>
      )}
    </section>
  );
}

function NoteSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card animate-pulse space-y-3">
          <div className="h-4 w-1/3 rounded bg-white/10" />
          <div className="h-5 w-3/4 rounded bg-white/10" />
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}
