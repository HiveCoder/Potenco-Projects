import CandidateCard from './CandidateCard.jsx';

function MatchList({ matches, selectedCandidate, onSelect }) {
  return (
    <section className="glass-panel-strong p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Match Queue</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Ranked candidates</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          {matches.length} profiles
        </div>
      </div>

      {matches.length ? (
        <div className="space-y-4">
          {matches.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              selected={selectedCandidate?.id === candidate.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-400">
          No candidates available for the current view.
        </div>
      )}
    </section>
  );
}

export default MatchList;