import { useState, useEffect, useRef } from "react";
import { HiPlay, HiPause, HiRefresh, HiCog } from "react-icons/hi";

const MODES = [
  { label:"Focus",     minutes:25, color:"brand"  },
  { label:"Short Break",minutes:5, color:"cyan"   },
  { label:"Long Break", minutes:15,color:"pink"   },
];

export default function FocusMode() {
  const [modeIdx, setModeIdx]     = useState(0);
  const [seconds, setSeconds]     = useState(MODES[0].minutes * 60);
  const [running, setRunning]     = useState(false);
  const [sessions, setSessions]   = useState(0);
  const [customMin, setCustomMin] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const intervalRef = useRef(null);

  const mode = MODES[modeIdx];
  const total = (customMin ? parseInt(customMin) : mode.minutes) * 60;
  const progress = ((total - seconds) / total) * 100;

  useEffect(() => {
    setSeconds(total);
    setRunning(false);
  }, [modeIdx, customMin]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (modeIdx === 0) setSessions(n => n + 1);
            // Browser notification
            if (Notification.permission === "granted") {
              new Notification("Notez 🐙", {
                body: modeIdx === 0 ? "Focus session done! Take a break 🎉" : "Break over! Back to work 💪"
              });
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, modeIdx]);

  const requestNotifPerm = () => {
    if ("Notification" in window) Notification.requestPermission();
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const circumference = 2 * Math.PI * 90; // r=90

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in text-center">
      <h1 className="font-display font-bold text-2xl text-white">⏱️ Focus Mode</h1>

      {/* Mode selector */}
      <div className="flex gap-2 justify-center">
        {MODES.map((m, i) => (
          <button key={i} onClick={() => { setModeIdx(i); setCustomMin(""); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              modeIdx === i && !showCustom ? "bg-brand-600 text-white" : "bg-surface-card text-purple-400 border border-surface-border hover:bg-surface-hover"
            }`}>{m.label}</button>
        ))}
        <button onClick={() => setShowCustom(s => !s)}
          className={`px-3 py-2 rounded-xl text-sm transition-all ${showCustom ? "bg-brand-600 text-white" : "bg-surface-card text-purple-400 border border-surface-border"}`}>
          <HiCog />
        </button>
      </div>

      {showCustom && (
        <div className="flex items-center justify-center gap-3">
          <input type="number" min="1" max="120" value={customMin} onChange={e => setCustomMin(e.target.value)}
            className="input w-24 text-center" placeholder="min" />
          <span className="text-purple-400 text-sm">minutes</span>
        </div>
      )}

      {/* Timer ring */}
      <div className="relative inline-flex items-center justify-center">
        <svg width="220" height="220" className="-rotate-90">
          <circle cx="110" cy="110" r="90" fill="none" stroke="#2d1f4e" strokeWidth="10" />
          <circle cx="110" cy="110" r="90" fill="none" stroke="#7c3aed" strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * progress / 100)}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-5xl text-white">{fmt(seconds)}</span>
          <span className="text-purple-400 text-sm mt-1">{mode.label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button onClick={() => setRunning(r => !r)} className="btn-primary flex items-center gap-2 px-8 py-3 text-lg">
          {running ? <><HiPause /> Pause</> : <><HiPlay /> {seconds === total ? "Start" : "Resume"}</>}
        </button>
        <button onClick={() => { setRunning(false); setSeconds(total); }} className="btn-ghost px-4 py-3">
          <HiRefresh className="text-xl" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card py-4">
          <div className="font-display font-bold text-2xl text-white">{sessions}</div>
          <div className="text-xs text-purple-500">Sessions today 🍅</div>
        </div>
        <div className="card py-4">
          <div className="font-display font-bold text-2xl text-white">{sessions * 25}m</div>
          <div className="text-xs text-purple-500">Minutes focused</div>
        </div>
      </div>

      <button onClick={requestNotifPerm} className="text-xs text-purple-500 hover:text-purple-300 transition-colors">
        🔔 Enable notifications for session alerts
      </button>
    </div>
  );
}
