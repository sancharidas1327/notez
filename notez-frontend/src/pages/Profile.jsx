import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import NoteCard from "../components/notes/NoteCard";
import XPBar from "../components/xp/XPBar";
import toast from "react-hot-toast";
import { HiPencil, HiCheck, HiX } from "react-icons/hi";

export default function Profile({ me }) {
  const { id }         = useParams();
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ name: "", bio: "", college: "" });

  const targetId = me ? user?._id : id;

  useEffect(() => {
    if (!targetId) return;
    api.get(`/users/${targetId}/profile`)
      .then(r => {
        setProfile(r.data.user);
        setNotes(r.data.notes);
        setForm({ name: r.data.user.name, bio: r.data.user.bio, college: r.data.user.college });
      })
      .finally(() => setLoading(false));
  }, [targetId]);

  const saveProfile = async () => {
    try {
      await api.put("/users/me", form);
      await refreshUser();
      toast.success("Profile updated!");
      setEditing(false);
      const r = await api.get(`/users/${targetId}/profile`);
      setProfile(r.data.user);
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <div className="text-center py-20 text-brand-400 animate-pulse text-3xl">🐙</div>;
  if (!profile) return <div className="text-center py-20 text-purple-500">User not found.</div>;

  const isOwn = user && user._id === profile._id;

  const badgeMap = { uploader: "📤", scholar: "🎓", helper: "🤝", top10: "🏆", streak7: "🔥" };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {profile.avatar
                ? <img src={profile.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
                : profile.name[0].toUpperCase()}
            </div>
            <div>
              {editing ? (
                <input
                  className="input text-lg font-bold py-1 mb-1"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              ) : (
                <h1 className="font-display font-bold text-white text-xl">{profile.name}</h1>
              )}
              <p className="text-purple-400 text-sm">
                {profile.college || "VIT Chennai"} ·{" "}
                <span className={`font-semibold ${profile.plan === "premium" ? "text-accent-gold" : "text-purple-500"}`}>
                  {profile.plan === "premium" ? "⭐ Premium" : "Free"}
                </span>
              </p>
            </div>
          </div>

          {isOwn && (
            editing ? (
              <div className="flex gap-2">
                <button onClick={saveProfile} className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"><HiCheck /> Save</button>
                <button onClick={() => setEditing(false)} className="btn-ghost py-1.5 px-3 text-sm flex items-center gap-1"><HiX /> Cancel</button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-ghost py-1.5 px-3 text-sm flex items-center gap-1">
                <HiPencil /> Edit
              </button>
            )
          )}
        </div>

        {/* Bio */}
        <div className="mt-4">
          {editing ? (
            <>
              <textarea
                className="input text-sm resize-none h-20 mb-2"
                placeholder="Bio..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              />
              <input
                className="input text-sm"
                placeholder="College"
                value={form.college}
                onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
              />
            </>
          ) : profile.bio ? (
            <p className="text-purple-300 text-sm">{profile.bio}</p>
          ) : null}
        </div>

        {/* XP bar */}
        <div className="mt-4">
          <XPBar xp={profile.xp} level={profile.level} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4 text-center">
          {[
            { label: "XP",        value: profile.xp },
            { label: "Level",     value: profile.level },
            { label: "Uploads",   value: profile.totalUploads },
            { label: "Streak 🔥", value: profile.streak },
          ].map(s => (
            <div key={s.label} className="bg-surface-hover rounded-xl py-2">
              <div className="font-bold text-white text-lg">{s.value}</div>
              <div className="text-xs text-purple-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.badges.map(b => (
              <span key={b} className="badge bg-brand-600/20 text-brand-300 border border-brand-600/30">
                {badgeMap[b] || "🏅"} {b}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <section>
        <h2 className="font-display font-bold text-white text-lg mb-3">
          📚 {isOwn ? "My" : `${profile.name}'s`} Notes
        </h2>
        {notes.length === 0 ? (
          <div className="card text-center text-purple-500 py-10">No public notes yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {notes.map(n => <NoteCard key={n._id} note={n} />)}
          </div>
        )}
      </section>
    </div>
  );
}
