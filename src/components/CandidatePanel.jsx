function CandidatePanel({ candidate, loading, isShortlisted, onToggleShortlist, onViewProfile }) {
  if (!candidate) {
    return (
      <aside className="glass-panel-strong sticky top-6 p-6">
        <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Profile Insight</p>
        <h2 className="mt-3 text-xl font-semibold text-white">Select a candidate</h2>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Choose a profile from the match list to inspect skill fit, experience coverage, and quick actions.
        </p>
      </aside>
    );
  }

  const experienceFill = Math.min(100, candidate.experience * 20);

  return (
    <aside className="glass-panel-strong sticky top-6 overflow-hidden p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 opacity-80" />
      <div className="relative">
        <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Profile Insight</p>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 text-xl font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            {candidate.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">{candidate.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{candidate.location} · {candidate.experience} years experience</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-cyan-400/15 bg-cyan-400/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Overall Match Score</p>
            <span className="text-sm font-medium text-cyan-300">Live ranking</span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-slate-950/60">
              <div
                className="absolute inset-1 rounded-full"
                style={{
                  background: `conic-gradient(#8b5cf6 ${candidate.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`
                }}
              />
              <div className="absolute inset-2 rounded-full bg-slate-950" />
              <div className="relative text-center">
                <div className="text-2xl font-semibold text-white">{candidate.score}</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Score</div>
              </div>
            </div>
            <div className="text-sm leading-6 text-slate-300">
              {candidate.explanations[0]}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Matched Skills</h3>
              <span className="text-sm text-cyan-300">{candidate.matchedSkills.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {candidate.matchedSkills.map((skill) => (
                <span
                  key={`${candidate.id}-${skill}`}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Missing Skills</h3>
              <span className="text-sm text-rose-300">{candidate.missingSkills.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {candidate.missingSkills.length ? candidate.missingSkills.map((skill) => (
                <span
                  key={`${candidate.id}-missing-${skill}`}
                  className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-sm text-rose-200"
                >
                  {skill}
                </span>
              )) : <span className="text-sm text-slate-400">No missing skills detected.</span>}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Experience Coverage</h3>
              <span className="text-sm text-slate-300">{candidate.experience} years</span>
            </div>
            <div className="h-3 rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                style={{ width: `${experienceFill}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onToggleShortlist(candidate)}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-70"
            >
              {isShortlisted ? 'Remove from Shortlist' : 'Shortlist Candidate'}
            </button>
            <button
              type="button"
              onClick={() => onViewProfile(candidate)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default CandidatePanel;