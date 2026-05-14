import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import NoteCard from "../components/notes/NoteCard";
import toast from "react-hot-toast";
import { HiUpload, HiTrash } from "react-icons/hi";

export default function MyNotes() {
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get("/users/me/uploads")
       .then(r => setNotes(r.data))
       .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Remove this note?")) return;
    try {
      await api.delete(`/notes/${id}`);
      toast.success("Note removed");
      setNotes(n => n.filter(x => x._id !== id));
    } catch {
      toast.error("Could not delete note");
    }
  };

  if (loading) return <div className="text-center py-20 text-brand-400 animate-pulse text-3xl">🐙</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-2xl">My Notes</h1>
          <p className="text-purple-500 text-sm mt-1">{notes.length} uploaded</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2 text-sm">
          <HiUpload /> Upload New
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-purple-400 mb-4">You haven't uploaded any notes yet.</p>
          <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
            <HiUpload /> Upload your first note
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <div key={note._id} className="relative group">
              <NoteCard note={note} />
              {/* Delete overlay */}
              <button
                onClick={() => handleDelete(note._id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity
                           bg-red-500/20 hover:bg-red-500/40 text-red-400 p-1.5 rounded-lg"
                title="Delete note"
              >
                <HiTrash />
              </button>
              {/* Status badge */}
              {note.status === "flagged" && (
                <div className="absolute bottom-3 left-3">
                  <span className="badge bg-amber-500/20 text-amber-300">⚠️ Flagged</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
