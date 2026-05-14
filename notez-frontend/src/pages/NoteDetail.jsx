import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useOffline } from "../context/OfflineContext";
import { getCachedNote, cacheNote, saveRecent } from "../services/offlineDB";
import toast from "react-hot-toast";
import {
  HiHeart, HiDownload, HiBookmark, HiStar,
  HiChat, HiArrowLeft, HiEye
} from "react-icons/hi";

export default function NoteDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isOnline, queueAction } = useOffline();

  const [note, setNote]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating]   = useState(0);
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (isOnline) {
        try {
          const { data } = await api.get(`/notes/${id}`);
          setNote(data);
          await cacheNote(data);   // cache for offline
          await saveRecent(data);
        } catch { const cached = await getCachedNote(id); setNote(cached); }
      } else {
        const cached = await getCachedNote(id);
        setNote(cached);
      }
      setLoading(false);
    };
    load();
  }, [id, isOnline]);

  const handleLike = async () => {
    if (!user) return toast.error("Login to like notes");
    if (!isOnline) {
      await queueAction("post", `/notes/${id}/like`);
      return toast("Queued! Will sync when online 📶");
    }
    const { data } = await api.post(`/notes/${id}/like`);
    setNote(n => ({ ...n, likes: data.liked
      ? [...(n.likes||[]), user._id]
      : (n.likes||[]).filter(l => l !== user._id)
    }));
  };

  const handleBookmark = async () => {
    if (!user) return toast.error("Login to bookmark notes");
    if (!isOnline) {
      await queueAction("post", `/notes/${id}/bookmark`);
      return toast("Queued! Will sync when online 📶");
    }
    const { data } = await api.post(`/notes/${id}/bookmark`);
    toast(data.bookmarked ? "Bookmarked! 🔖" : "Removed bookmark");
  };

  const handleDownload = async () => {
    if (!user) return toast.error("Login to download notes");
    if (isOnline) await api.post(`/notes/${id}/download`);
    const a = document.createElement("a");
    a.href  = note.fileUrl;
    a.download = note.title;
    a.click();
    if (isOnline) toast.success("+10 XP to the creator! ⚡");
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const { data } = await api.post(`/notes/${id}/comment`, { text: comment });
    setNote(n => ({ ...n, comments: [...(n.comments||[]), data] }));
    setComment("");
  };

  const handleRate = async (val) => {
    if (!user) return toast.error("Login to rate");
    const { data } = await api.post(`/notes/${id}/rate`, { value: val });
    setNote(n => ({ ...n, averageRating: data.averageRating }));
    setRating(val);
    toast.success("Rated! ⭐");
  };

  if (loading) return <div className="text-center py-20 text-brand-400 animate-pulse text-4xl">🐙</div>;
  if (!note)   return <div className="text-center py-20 text-purple-500">Note not found or not cached offline.</div>;

  const isLiked = user && note.likes?.includes(user._id);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/browse" className="flex items-center gap-2 text-purple-400 hover:text-white text-sm transition-colors">
        <HiArrowLeft /> Back to Browse
      </Link>

      {/* Header */}
      <div className="card space-y-4">
        <div className="flex gap-2 flex-wrap">
          <span className="badge bg-brand-600/20 text-brand-300">{note.subject}</span>
          <span className="badge bg-surface-hover text-purple-400 uppercase text-xs">{note.fileType}</span>
          {note.isPremium && <span className="badge bg-accent-gold/20 text-accent-gold">⭐ Premium</span>}
        </div>

        <h1 className="font-display font-bold text-2xl text-white">{note.title}</h1>
        {note.description && <p className="text-purple-400">{note.description}</p>}

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map(t => <span key={t} className="badge bg-surface-hover text-purple-400">#{t}</span>)}
          </div>
        )}

        {/* Author & stats */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-border flex-wrap gap-3">
          <Link to={`/users/${note.author?._id}`} className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-sm font-bold text-white">
              {note.author?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{note.author?.name}</p>
              <p className="text-xs text-purple-500">Lv {note.author?.level}</p>
            </div>
          </Link>
          <div className="flex gap-4 text-sm text-purple-500">
            <span className="flex items-center gap-1"><HiEye />{note.views}</span>
            <span className="flex items-center gap-1"><HiDownload />{note.downloads}</span>
          </div>
        </div>
      </div>

      {/* File preview */}
      <div className="card">
        <h2 className="font-semibold text-white mb-3">📄 Preview</h2>
        {note.fileType === "pdf" ? (
          <iframe src={note.fileUrl} className="w-full h-96 rounded-lg border border-surface-border" />
        ) : note.fileType === "image" ? (
          <img src={note.fileUrl} alt={note.title} className="w-full rounded-lg border border-surface-border max-h-96 object-contain" />
        ) : (
          <div className="bg-surface-hover rounded-lg p-4 text-purple-300 text-sm font-mono">
            Text file — download to read full content.
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleLike}
          className={`btn-ghost flex items-center gap-2 ${isLiked ? "border-pink-500/50 text-pink-400" : ""}`}>
          <HiHeart className={isLiked ? "text-pink-500" : ""} /> {note.likes?.length ?? 0} Like
        </button>
        <button onClick={handleBookmark} className="btn-ghost flex items-center gap-2">
          <HiBookmark className="text-accent-cyan" /> Bookmark
        </button>
        <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
          <HiDownload /> Download
        </button>
      </div>

      {/* Rating */}
      <div className="card">
        <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
          <HiStar className="text-accent-gold" /> Rate this note
          {note.averageRating > 0 && <span className="text-accent-gold font-bold">{note.averageRating.toFixed(1)}</span>}
        </h2>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(s => (
            <button key={s}
              onMouseEnter={() => setHoverStar(s)}
              onMouseLeave={() => setHoverStar(0)}
              onClick={() => handleRate(s)}
              className="text-3xl transition-transform hover:scale-125"
            >{s <= (hoverStar || rating) ? "⭐" : "☆"}</button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <HiChat className="text-brand-400" /> Comments ({note.comments?.length ?? 0})
        </h2>

        {user && (
          <form onSubmit={handleComment} className="flex gap-3">
            <input className="input flex-1" value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." />
            <button type="submit" className="btn-primary px-4">Send</button>
          </form>
        )}

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {(note.comments || []).slice().reverse().map((c, i) => (
            <div key={i} className="flex gap-3 bg-surface-hover rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {c.user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{c.user?.name}</p>
                <p className="text-sm text-purple-300">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
