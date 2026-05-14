import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch(err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="app-ambient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <div className="hidden lg:block">
          <span className="eyebrow">Notez access</span>
          <h1 className="mt-5 max-w-xl font-display text-6xl font-bold leading-none text-white">Jump back into your study workspace.</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-400">Your uploads, XP, bookmarks, focus sessions, and campus notes stay synced in one polished dashboard.</p>
        </div>

        <div className="glass-panel w-full space-y-6 p-6 animate-slide-up md:p-8">
          <div>
            <span className="brand-mark mb-5">Nz</span>
            <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-slate-400">Login to continue to Notez.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <input className="input" type="email" placeholder="Email" autoComplete="email"
              value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            <input className="input" type="password" placeholder="Password" autoComplete="current-password"
              value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
              <span>{loading ? "Logging in..." : "Login"}</span>
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-cyan-200 hover:text-white">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
