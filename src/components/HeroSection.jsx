import Chatbot from './Chatbot.jsx';

function HeroSection({ knownSkills, suggestedPrompt, onSubmit, loading, onRunMatching, role }) {
  const chips = [role.location || 'Remote-ready', role.experience ? `${role.experience}+ yrs` : 'All levels'];

  return (
    <section className="glass-panel-strong relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_28%)]" />
      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.14)]">
            Search & Match
          </div>
          <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl xl:text-6xl">
            Find the best talent, <span className="text-gradient">instantly</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Use the existing role parser and matching engine through a premium dashboard built for recruiting teams that need fast, explainable candidate ranking.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur"
              >
                {chip}
              </span>
            ))}
            <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-200 backdrop-blur">
              {role.skills.length ? `${role.skills.length} key skills` : 'Skill discovery'}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onRunMatching}
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? 'Running Matching...' : 'Run Matching'}
            </button>
            <div className="text-sm text-slate-400">
              Chat-driven role parsing with ranked candidate output.
            </div>
          </div>
        </div>

        <Chatbot
          knownSkills={knownSkills}
          suggestedPrompt={suggestedPrompt}
          onSubmit={onSubmit}
          loading={loading}
        />
      </div>
    </section>
  );
}

export default HeroSection;