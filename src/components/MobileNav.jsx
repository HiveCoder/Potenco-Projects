import { Link } from 'react-router-dom';

const sections = ['Dashboard', 'Search & Match', 'Candidates', 'Jobs / Roles', 'Shortlisted', 'Analytics', 'Settings'];

function MobileNav({ activeSection, onNavigate, theme, onThemeToggle, onReturnHome }) {
  return (
    <div className="glass-panel-strong mb-4 p-4 lg:hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">TalentHub</p>
          <h1 className="mt-1 text-lg font-semibold text-white">Recruiter Workspace</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            onClick={onReturnHome}
            className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-200"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={onThemeToggle}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <Link to="/apply" className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">
            Apply
          </Link>
        </div>
      </div>

      <div className="scrollbar-hidden flex gap-2 overflow-x-auto pb-1">
        {sections.map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => onNavigate(section)}
            className={[
              'shrink-0 rounded-full px-4 py-2 text-xs transition',
              activeSection === section
                ? 'bg-gradient-to-r from-purple-500/30 via-blue-500/25 to-cyan-400/20 text-white ring-1 ring-inset ring-white/15'
                : 'border border-white/10 bg-white/5 text-slate-300'
            ].join(' ')}
          >
            {section}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MobileNav;