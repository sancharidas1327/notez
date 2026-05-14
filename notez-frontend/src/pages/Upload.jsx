import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { HiUpload, HiX } from "react-icons/hi";
import SubjectPicker from "../components/notes/SubjectPicker";

export default function Upload() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [form, setForm]     = useState({ title:"", description:"", subject:"", customSubject:"", tags:"", college:"", isPremium:false });
  const [file, setFile]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag]     = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    const subject = form.subject === "Other" ? form.customSubject.trim() : form.subject;
    if (!form.title || !subject) return toast.error("Title and subject are required");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      Object.entries({ ...form, subject }).forEach(([k,v]) => {
        if (k === "customSubject") return;
        fd.append(k, k === "tags" ? JSON.stringify(v.split(",").map(t=>t.trim()).filter(Boolean)) : v);
      });

      await api.post("/notes/upload", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      await refreshUser();
      toast.success("Note uploaded! +50 XP ⚡");
      navigate("/my-notes");
    } catch(err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-white mb-6">📤 Upload a Note</h1>
      <div className="card bg-brand-900/10 border-brand-600/30 mb-6 text-sm text-brand-300 flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        Earn <strong>50 XP</strong> for uploading + bonus XP every time someone likes or downloads your note!
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* File drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();setDrag(true)}}
          onDragLeave={()=>setDrag(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            drag ? "border-brand-500 bg-brand-600/10" : "border-surface-border hover:border-brand-600/50"
          }`}
          onClick={() => document.getElementById("fileInput").click()}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-brand-300 font-medium">{file.name}</span>
              <button type="button" onClick={e=>{e.stopPropagation();setFile(null)}} className="text-red-400 hover:text-red-300"><HiX /></button>
            </div>
          ) : (
            <>
              <HiUpload className="text-4xl text-purple-500 mx-auto mb-2" />
              <p className="text-purple-400">Drag & drop or click to select</p>
              <p className="text-xs text-purple-600 mt-1">PDF, PNG, JPG, JPEG, TXT — max 20MB</p>
            </>
          )}
          <input id="fileInput" type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.txt,.webp"
            onChange={e => setFile(e.target.files[0])} />
        </div>

        <input className="input" placeholder="Note title *" value={form.title} onChange={e=>set("title",e.target.value)} required />

        <textarea className="input resize-none h-24" placeholder="Short description (optional)"
          value={form.description} onChange={e=>set("description",e.target.value)} />

        <div className="space-y-2">
          <SubjectPicker value={form.subject} onChange={value => set("subject", value)} required />
          <p className="px-1 text-xs text-slate-500">Can&apos;t find it? Choose Other and type the exact subject below.</p>
        </div>

        {form.subject === "Other" && (
          <input
            className="input"
            placeholder="Exact subject name e.g. Digital Signal Processing"
            value={form.customSubject}
            onChange={e=>set("customSubject",e.target.value)}
            required
          />
        )}

        <input className="input" placeholder="Tags (comma separated) e.g. algebra, chapter3, CSE1001"
          value={form.tags} onChange={e=>set("tags",e.target.value)} />

        <input className="input" placeholder="College (optional)" value={form.college} onChange={e=>set("college",e.target.value)} />

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className={`w-11 h-6 rounded-full transition-colors ${form.isPremium ? "bg-brand-600" : "bg-surface-hover"} relative`}
            onClick={()=>set("isPremium",!form.isPremium)}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isPremium ? "translate-x-6" : "translate-x-1"}`} />
          </div>
          <span className="text-purple-300 text-sm">Premium note (requires XP to access)</span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full text-center flex items-center justify-center gap-2 py-3 disabled:opacity-50">
          {loading ? "Uploading..." : <><HiUpload /> Upload Note (+50 XP)</>}
        </button>
      </form>
    </div>
  );
}
