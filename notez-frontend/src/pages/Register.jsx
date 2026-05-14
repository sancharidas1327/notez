import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", college:"" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be 6+ characters"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.college);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="app-ambient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <div className="hidden lg:block">
          <span className="eyebrow">Start earning XP</span>
          <h1 className="mt-5 max-w-xl font-display text-6xl font-bold leading-none text-white">Turn useful notes into campus momentum.</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-400">Create your account, upload quality material, and build a visible contribution profile.</p>
        </div>

        <div className="glass-panel w-full space-y-6 p-6 animate-slide-up md:p-8">
          <div>
            <span className="brand-mark mb-5">Nz</span>
            <h1 className="font-display text-3xl font-bold text-white">Join Notez</h1>
            <p className="mt-1 text-slate-400">Upload notes, earn XP, and rise up.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <input className="input" placeholder="Full name" value={form.name}
              onChange={set("name")} required />
            <input className="input" type="email" placeholder="Email" value={form.email}
              onChange={set("email")} required />
            <input className="input" type="password" placeholder="Password (6+ chars)" value={form.password}
              onChange={set("password")} required />
            <input className="input" placeholder="College (e.g. VIT Chennai)" value={form.college}
              onChange={set("college")} />

            <div className="rounded-xl border border-cyan-200/15 bg-cyan-200/10 p-3 text-sm font-medium text-cyan-100">
              Start at Level 1. Earn XP from daily logins, uploads, likes, and downloads.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
              <span>{loading ? "Creating account..." : "Create Account"}</span>
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-cyan-200 hover:text-white">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
