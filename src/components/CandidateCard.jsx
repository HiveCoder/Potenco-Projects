const getStatus = (score) => {
  if (score >= 85) {
    return { label: 'Excellent', tone: 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10' };
  }

  if (score >= 70) {
    return { label: 'Good', tone: 'text-cyan-300 border-cyan-400/20 bg-cyan-400/10' };
  }

  return { label: 'Review', tone: 'text-amber-300 border-amber-400/20 bg-amber-400/10' };
};

function CandidateCard({ candidate, selected, onSelect }) {
  const status = getStatus(candidate.score);
  const roleLabel = candidate.matchedSkills[0] ? `${candidate.matchedSkills[0]} Specialist` : 'Generalist';

  return (
    <button
      type="button"
      onClick={() => onSelect(candidate)}
      className={[
        'glass-panel w-full p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]',
        selected ? 'ring-1 ring-cyan-300/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : ''
      ].join(' ')}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/80 via-blue-500/80 to-cyan-400/80 text-lg font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            {candidate.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="truncate text-lg font-semibold text-white">{candidate.name}</h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${status.tone}`}>
                {status.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {roleLabel} · {candidate.location} · {candidate.experience} years experience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="grid gap-2">
            <div className="flex flex-wrap gap-2">
              {candidate.matchedSkills.slice(0, 4).map((skill) => (
                <span
                  key={`${candidate.id}-${skill}`}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
                >
                  {skill}
                </span>
              ))}
              {candidate.missingSkills.slice(0, 2).map((skill) => (
                <span
                  key={`${candidate.id}-missing-${skill}`}
                  className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-200"
                >
                  Missing {skill}
                </span>
              ))}
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-400">
              {candidate.explanations.slice(0, 2).map((item) => (
                <li key={`${candidate.id}-${item}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-950/60">
            <div
              className="absolute inset-1 rounded-full"
              style={{
                background: `conic-gradient(#22d3ee ${candidate.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`
              }}
            />
            <div className="absolute inset-2 rounded-full bg-slate-950" />
            <div className="relative text-center">
              <div className="text-lg font-semibold text-white">{candidate.score}</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Match</div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default CandidateCard;