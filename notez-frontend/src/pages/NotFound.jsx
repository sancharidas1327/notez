import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="text-8xl mb-6">🐙</div>
      <h1 className="font-display font-bold text-white text-4xl mb-2">404</h1>
      <p className="text-purple-400 text-lg mb-6">Oops — this page swam away.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
