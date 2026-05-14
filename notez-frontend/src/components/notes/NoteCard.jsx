import { Link } from "react-router-dom";
import { HiHeart, HiDownload, HiStar, HiDocumentText } from "react-icons/hi";

const subjectColors = {
  Math: "bg-blue-400/10 text-blue-100",
  Physics: "bg-cyan-300/10 text-cyan-100",
  Chemistry: "bg-emerald-300/10 text-emerald-100",
  Biology: "bg-teal-300/10 text-teal-100",
  CS: "bg-violet-300/10 text-violet-100",
  English: "bg-rose-300/10 text-rose-100",
  History: "bg-amber-300/10 text-amber-100",
  default: "bg-white/[0.07] text-slate-200",
};

export default function NoteCard({ note }) {
  const color = subjectColors[note.subject] || subjectColors.default;

  return (
    <Link to={`/notes/${note._id}`} className="card group block overflow-hidden">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className={`badge ${color}`}>{note.subject}</span>
        <span className="flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-xs font-semibold uppercase text-slate-500">
          <HiDocumentText />{note.fileType}
        </span>
      </div>

      <h3 className="mb-2 font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-cyan-100 line-clamp-2">
        {note.title}
      </h3>
      {note.description && (
        <p className="mb-4 text-sm leading-6 text-slate-400 line-clamp-2">{note.description}</p>
      )}

      {note.tags?.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {note.tags.slice(0, 3).map(t => (
            <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-slate-400">#{t}</span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1"><HiHeart className="text-rose-300" />{note.likes?.length ?? 0}</span>
          <span className="flex items-center gap-1"><HiDownload className="text-cyan-200" />{note.downloads ?? 0}</span>
          {note.averageRating > 0 && (
            <span className="flex items-center gap-1"><HiStar className="text-amber-200" />{note.averageRating.toFixed(1)}</span>
          )}
        </div>
        {note.author && (
          <span className="max-w-[120px] truncate text-xs text-slate-500">by {note.author.name}</span>
        )}
      </div>
    </Link>
  );
}
