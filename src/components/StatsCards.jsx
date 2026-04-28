const statsConfig = [
  {
    key: 'ranked',
    label: 'Candidates Ranked',
    accent: 'from-purple-500 to-blue-500',
    growth: '+12.4%',
    icon: '◌'
  },
  {
    key: 'skills',
    label: 'Skills Detected',
    accent: 'from-blue-500 to-cyan-400',
    growth: '+8.2%',
    icon: '△'
  },
  {
    key: 'experience',
    label: 'Experience Target',
    accent: 'from-cyan-400 to-emerald-400',
    growth: '+3.1%',
    icon: '▣'
  },
  {
    key: 'location',
    label: 'Location Precision',
    accent: 'from-fuchsia-500 to-purple-500',
    growth: '+5.7%',
    icon: '✦'
  }
];

function StatsCards({ role, matches }) {
  const values = {
    ranked: matches.length,
    skills: role.skills.length || 0,
    experience: `${role.experience || 0} yrs`,
    location: role.location || 'Flexible'
  };

  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {statsConfig.map((item) => (
        <article
          key={item.key}
          className="glass-panel group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${item.accent} opacity-80`} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{values[item.key]}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-lg text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]`}>
              {item.icon}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="text-emerald-300">{item.growth}</span>
            <span className="text-slate-500">vs last run</span>
          </div>
        </article>
      ))}
    </section>
  );
}

export default StatsCards;