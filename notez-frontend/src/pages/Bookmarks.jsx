import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import NoteCard from "../components/notes/NoteCard";
import { HiSearch } from "react-icons/hi";

export default function Bookmarks() {
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    api.get("/users/me/bookmarks")
       .then(r => setNotes(r.data))
       .finally(() => setLoading(false));
  }, []);

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 text-brand-400 animate-pulse text-3xl">🐙</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Bookmarks</h1>
        <p className="text-purple-500 text-sm mt-1">{notes.length} saved notes</p>
      </div>

      {notes.length > 0 && (
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" />
          <input
            className="input pl-10"
            placeholder="Search bookmarks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {notes.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔖</div>
          <p className="text-purple-400 mb-4">No bookmarks yet. Save notes you love!</p>
          <Link to="/browse" className="btn-primary">Browse Notes</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-10 text-purple-500">No matches found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(n => <NoteCard key={n._id} note={n} />)}
        </div>
      )}
    </div>
  );
}
