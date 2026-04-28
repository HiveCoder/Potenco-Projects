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

function Sidebar() {
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
          {navigationItems.map((item, index) => {
            const active = index === 1;

            return (
              <button
                key={item}
                type="button"
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
              </button>
            );
          })}
        </nav>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">System Health</p>
        <p className="mt-3 text-sm font-medium text-slate-100">Matching engine online</p>
        <p className="mt-1 text-sm text-slate-400">Realtime ranking and candidate analysis ready.</p>
      </div>
    </aside>
  );
}

export default Sidebar;