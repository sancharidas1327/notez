import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import XPBar from "../components/xp/XPBar";

const medals = ["🥇","🥈","🥉"];

export default function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers]   = useState([]);
  const [history, setHist]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState("board");

  useEffect(() => {
    api.get("/xp/leaderboard").then(r => setUsers(r.data)).finally(() => setLoading(false));
    if (user) api.get("/xp/history").then(r => setHist(r.data));
  }, [user]);

  const myRank = users.findIndex(u => u._id === user?._id) + 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-white">🏆 Leaderboard</h1>

      {/* My stats banner */}
      {user && myRank > 0 && (
        <div className="card bg-brand-900/20 border-brand-600/40 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-brand-300 font-semibold">Your Rank</span>
            <span className="font-display font-bold text-2xl text-white">#{myRank}</span>
          </div>
          <XPBar xp={user.xp} level={user.level} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {["board","history","redeem"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              tab === t ? "bg-brand-600 text-white" : "bg-surface-card text-purple-400 hover:bg-surface-hover border border-surface-border"
            }`}>{t === "board" ? "🏆 Rankings" : t === "history" ? "⚡ XP History" : "🎁 Redeem"}</button>
        ))}
      </div>

      {tab === "board" && (
        loading ? <p className="text-purple-500">Loading...</p> : (
          <div className="space-y-3">
            {users.map((u, i) => (
              <Link to={`/users/${u._id}`} key={u._id}
                className={`card flex items-center gap-4 hover:border-brand-600/50 ${u._id === user?._id ? "border-brand-600/40 bg-brand-900/10" : ""}`}>
                <span className="text-2xl w-8 text-center flex-shrink-0">
                  {i < 3 ? medals[i] : <span className="text-purple-500 font-bold text-sm">#{i+1}</span>}
                </span>
                <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center font-bold text-white flex-shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{u.name} {u._id === user?._id && <span className="text-brand-400 text-xs">(you)</span>}</p>
                  <p className="text-xs text-purple-500 truncate">{u.college || "Student"} · Lv {u.level}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-accent-gold">{u.xp} XP</p>
                  {u.badges?.length > 0 && <p className="text-xs">{u.badges.slice(0,3).join(" ")}</p>}
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === "history" && (
        <div className="space-y-2">
          {!user ? <p className="text-purple-500">Login to see your XP history.</p> :
           history.length === 0 ? <p className="text-purple-500">No XP activity yet. Start uploading notes!</p> :
           history.map((h, i) => (
            <div key={i} className="card flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-white capitalize">{h.type.replace(/_/g," ")}</p>
                <p className="text-xs text-purple-500">{h.description} · {new Date(h.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`font-bold ${h.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                {h.amount > 0 ? "+" : ""}{h.amount} XP
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "redeem" && <RedeemPanel user={user} />}
    </div>
  );
}

function RedeemPanel({ user }) {
  const [loading, setLoading] = useState(false);

  const redeem = async (type, cost, label) => {
    if (!user) return;
    if (user.xp < cost) { alert(`Need ${cost} XP. You have ${user.xp}.`); return; }
    setLoading(true);
    try {
      await api.post("/xp/redeem", { type });
      alert(`Redeemed ${label}! 🎉`);
    } catch(e) { alert(e.response?.data?.message || "Error"); }
    setLoading(false);
  };

  const rewards = [
    { type:"premium", cost:500, label:"1 Month Premium", icon:"👑", desc:"Unlimited uploads, AI tools, private chat rooms" },
    { type:"gift_card", cost:300, label:"Gift Card", icon:"🎁", desc:"Redeem for Amazon/Spotify voucher" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-purple-400 text-sm">Your XP: <span className="text-accent-gold font-bold">{user?.xp ?? 0}</span></p>
      {rewards.map(r => (
        <div key={r.type} className="card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{r.icon}</span>
            <div>
              <p className="font-semibold text-white">{r.label}</p>
              <p className="text-xs text-purple-500">{r.desc}</p>
              <p className="text-sm text-accent-gold font-bold mt-1">{r.cost} XP</p>
            </div>
          </div>
          <button onClick={() => redeem(r.type, r.cost, r.label)} disabled={loading || !user || user.xp < r.cost}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-40 flex-shrink-0">
            Redeem
          </button>
        </div>
      ))}
    </div>
  );
}
