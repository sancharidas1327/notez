export default function XPBar({ xp, level }) {
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel    = level * 100;
  const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return (
    <div className="px-2 py-1">
      <div className="mb-1.5 flex justify-between text-xs text-slate-500">
        <span className="font-semibold text-cyan-100">Level {level}</span>
        <span>{xp} / {xpForNextLevel} XP</span>
      </div>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </div>
  );
}
