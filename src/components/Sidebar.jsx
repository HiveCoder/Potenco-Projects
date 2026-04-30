import { Link } from 'react-router-dom';

const navigationItems = [
  'Dashboard',
  'Search & Match',
  'Candidates',
  'Jobs / Roles',
  'Shortlisted',
  'Chat Assistant',
  'Analytics',
  'Settings'
];

function Sidebar({ activeSection, onNavigate, candidateCount, shortlistedCount, theme, onThemeToggle, onReturnHome }) {
  return (
    <aside className="glass-panel-strong sticky top-6 hidden h-[calc(100vh-3rem)] w-[260px] shrink-0 flex-col justify-between overflow-hidden p-5 lg:flex">
      <div>
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 text-lg font-semibold text-white shadow-[0_0_25px_rgba(99,102,241,0.45)]">
            T
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Workspace</p>
            <h1 className="text-lg font-semibold text-white">TalentHub</h1>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const active = activeSection === item;
            const badge = item === 'Candidates' ? candidateCount : item === 'Shortlisted' ? shortlistedCount : null;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onNavigate(item)}
                className={[
                  'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition duration-200',
                  active
                    ? 'bg-gradient-to-r from-purple-500/30 via-blue-500/25 to-cyan-400/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-1 ring-inset ring-white/15'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                ].join(' ')}
              >
                <span
                  className={[
                    'h-2.5 w-2.5 rounded-full',
                    active ? 'bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]' : 'bg-slate-600'
                  ].join(' ')}
                />
                <span>{item}</span>
                {badge !== null ? (
                  <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="mt-4 space-y-3">
          <Link
            to="/"
            onClick={onReturnHome}
            className="flex w-full items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-left text-sm text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.12)] transition hover:bg-amber-400/15"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.9)]" />
            <span>Return Home</span>
          </Link>

          <Link
            to="/apply"
            className="flex w-full items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-left text-sm text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.12)] transition hover:bg-cyan-400/15"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
            <span>Candidate Apply</span>
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onThemeToggle}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
        >
          <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs uppercase tracking-[0.2em]">
            {theme}
          </span>
        </button>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">System Health</p>
          <p className="mt-3 text-sm font-medium text-slate-100">Matching engine online</p>
          <p className="mt-1 text-sm text-slate-400">Realtime ranking and candidate analysis ready.</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;