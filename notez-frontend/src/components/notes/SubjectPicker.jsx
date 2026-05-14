import { useMemo, useState } from "react";
import { HiChevronDown, HiSearch } from "react-icons/hi";
import { SUBJECT_GROUPS } from "../../data/subjects";

export default function SubjectPicker({ value, onChange, required = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUBJECT_GROUPS;

    return SUBJECT_GROUPS
      .map((group) => ({
        ...group,
        subjects: group.subjects.filter((subject) =>
          subject.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.subjects.length > 0);
  }, [query]);

  const choose = (subject) => {
    onChange(subject);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`input flex items-center justify-between gap-3 text-left ${
          value ? "text-slate-100" : "text-slate-500"
        }`}
        aria-expanded={open}
      >
        <span className="truncate">{value || "Select engineering subject *"}</span>
        <HiChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {required && (
        <input
          className="sr-only"
          tabIndex={-1}
          value={value}
          onChange={() => {}}
          required
        />
      )}

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-cyan-300/25 bg-[#10131f] shadow-2xl shadow-black/50">
          <div className="border-b border-white/10 p-3">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                autoFocus
                className="input py-2 pl-9 text-sm"
                placeholder="Search CSE, ECE, maths, mechanics..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filteredGroups.length === 0 ? (
              <button
                type="button"
                onClick={() => choose("Other")}
                className="w-full rounded-xl px-3 py-3 text-left text-sm text-slate-300 hover:bg-white/[0.07]"
              >
                No exact match. Use Other and add the subject in tags.
              </button>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.label} className="py-1">
                  <div className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/60">
                    {group.label}
                  </div>
                  <div className="grid gap-1">
                    {group.subjects.map((subject) => (
                      <button
                        type="button"
                        key={subject}
                        onClick={() => choose(subject)}
                        className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                          subject === value
                            ? "bg-cyan-300 text-slate-950"
                            : "text-slate-200 hover:bg-white/[0.07]"
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
