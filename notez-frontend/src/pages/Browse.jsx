import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useOffline } from "../context/OfflineContext";
import { getAllCachedNotes } from "../services/offlineDB";
import NoteCard from "../components/notes/NoteCard";
import { HiSearch, HiFilter } from "react-icons/hi";
import { BROWSE_SUBJECTS, FEATURED_BROWSE_SUBJECTS } from "../data/subjects";

const SORTS = [
  { value:"createdAt", label:"Latest" },
  { value:"trending",  label:"Trending" },
  { value:"rating",    label:"Top Rated" },
];

export default function Browse() {
  const { isOnline } = useOffline();
  const [params, setParams] = useSearchParams();

  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const search = params.get("search") || "";
  const subject = params.get("subject") || "";
  const sort = params.get("sort") || "createdAt";

  const setParam = (key, val) => {
    const p = new URLSearchParams(params);
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    setPage(1);
    setParams(p);
  };

  const load = useCallback(async () => {
    setLoading(true);
    if (!isOnline) {
      const cached = await getAllCachedNotes();
      const filtered = cached.filter(n =>
        (!subject || n.subject === subject) &&
        (!search || n.title.toLowerCase().includes(search.toLowerCase()))
      );
      setNotes(filtered);
      setTotal(filtered.length);
      setLoading(false);
      return;
    }
    try {
      const q = new URLSearchParams({ sort, page, limit: 12 });
      if (search) q.set("search", search);
      if (subject) q.set("subject", subject);
      const { data } = await api.get(`/notes?${q}`);
      setNotes(data.notes);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [search, subject, sort, page, isOnline]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-panel p-5 md:p-6">
        <span className="eyebrow">Library</span>
        <h1 className="mt-4 font-display text-4xl font-bold text-white">Browse Notes</h1>
        <p className="mt-2 text-slate-400">Search the campus knowledge base by topic, subject, quality, and recency.</p>
      </div>

      <div className="relative">
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500" />
        <input
          className="input pl-11"
          placeholder="Search notes, subjects, topics..."
          value={search}
          onChange={e => setParam("search", e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <HiFilter className="text-slate-500" />
        <div className="flex flex-wrap gap-2">
          {FEATURED_BROWSE_SUBJECTS.map(s => (
            <button key={s}
              onClick={() => setParam("subject", s === "All" ? "" : s)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
                (s === "All" && !subject) || s === subject
                  ? "bg-white text-slate-950"
                  : "border border-white/10 bg-white/[0.05] text-slate-400 hover:bg-white/[0.09] hover:text-white"
              }`}
            >{s}</button>
          ))}
        </div>
        <select
          value={subject}
          onChange={e => setParam("subject", e.target.value)}
          className="input w-full py-2 text-sm sm:w-64"
        >
          {BROWSE_SUBJECTS.map(s => (
            <option key={s} value={s === "All" ? "" : s}>{s === "All" ? "All subjects" : s}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={e => setParam("sort", e.target.value)}
          className="input ml-auto w-auto py-2 text-sm"
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <p className="text-sm font-medium text-slate-500">{total} notes found{!isOnline ? " (offline cache)" : ""}</p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-40 animate-pulse space-y-3">
              <div className="h-4 w-1/3 rounded bg-white/10" />
              <div className="h-5 w-3/4 rounded bg-white/10" />
              <div className="h-4 w-full rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="glass-panel py-20 text-center text-slate-400">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.07] font-display font-bold text-white">Nz</div>
          <p>No notes found. Be the first to upload.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map(n => <NoteCard key={n._id} note={n} />)}
        </div>
      )}

      {total > 12 && (
        <div className="flex justify-center gap-3 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-ghost px-4 py-2 disabled:opacity-40">Prev</button>
          <span className="self-center text-slate-400">Page {page} of {Math.ceil(total/12)}</span>
          <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/12)} className="btn-ghost px-4 py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
