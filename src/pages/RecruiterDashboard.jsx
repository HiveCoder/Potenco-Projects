import CandidatePanel from '../components/CandidatePanel.jsx';
import HeroSection from '../components/HeroSection.jsx';
import MatchList from '../components/MatchList.jsx';
import Sidebar from '../components/Sidebar.jsx';
import StatsCards from '../components/StatsCards.jsx';

function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="glass-panel-strong p-5 sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">TalentHub</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function CandidateDirectory({ candidates, selectedCandidate, onSelect, filterText, onFilterTextChange }) {
  const filteredCandidates = candidates.filter((candidate) => {
    const query = filterText.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [candidate.name, candidate.location, ...(candidate.skills || [])]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  return (
    <SectionCard
      title="Candidates"
      subtitle="Search across the current candidate pool, including newly submitted profiles."
      action={
        <input
          value={filterText}
          onChange={(event) => onFilterTextChange(event.target.value)}
          placeholder="Search candidates"
          className="w-full max-w-56 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
        />
      }
    >
      <MatchList matches={filteredCandidates} selectedCandidate={selectedCandidate} onSelect={onSelect} />
    </SectionCard>
  );
}

function RolesManager({ roleDraft, onRoleDraftChange, onApplyRole, loading }) {
  return (
    <SectionCard
      title="Jobs / Roles"
      subtitle="Adjust the active role definition used by the matching engine and rerun scoring instantly."
      action={
        <button
          type="button"
          onClick={onApplyRole}
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? 'Applying...' : 'Apply Role and Match'}
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Required Skills</span>
          <input
            value={roleDraft.skills}
            onChange={(event) => onRoleDraftChange('skills', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
            placeholder="React, JavaScript, Node.js"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Experience</span>
          <input
            type="number"
            min="0"
            value={roleDraft.experience}
            onChange={(event) => onRoleDraftChange('experience', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
            placeholder="2"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Location</span>
          <input
            value={roleDraft.location}
            onChange={(event) => onRoleDraftChange('location', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
            placeholder="Toronto"
          />
        </label>
      </div>
    </SectionCard>
  );
}

function AnalyticsView({ matches, shortlistedCandidates, allCandidates }) {
  const averageScore = matches.length
    ? Math.round(matches.reduce((total, candidate) => total + candidate.score, 0) / matches.length)
    : 0;
  const topLocations = Object.entries(
    allCandidates.reduce((accumulator, candidate) => {
      accumulator[candidate.location] = (accumulator[candidate.location] || 0) + 1;
      return accumulator;
    }, {})
  ).sort((left, right) => right[1] - left[1]).slice(0, 4);

  return (
    <SectionCard title="Analytics" subtitle="Operational insight into ranking quality, source pools, and shortlist performance.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-5">
          <p className="text-sm text-slate-400">Average Match Score</p>
          <p className="mt-3 text-3xl font-semibold text-white">{averageScore}</p>
        </div>
        <div className="glass-panel p-5">
          <p className="text-sm text-slate-400">Shortlisted Candidates</p>
          <p className="mt-3 text-3xl font-semibold text-white">{shortlistedCandidates.length}</p>
        </div>
        <div className="glass-panel p-5">
          <p className="text-sm text-slate-400">Total Candidate Pool</p>
          <p className="mt-3 text-3xl font-semibold text-white">{allCandidates.length}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-white">Top Candidate Locations</h3>
          <div className="mt-4 space-y-3">
            {topLocations.map(([location, count]) => (
              <div key={location} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <span>{location || 'Unspecified'}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-white">Top Matches</h3>
          <div className="mt-4 space-y-3">
            {matches.slice(0, 4).map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <span>{candidate.name}</span>
                <span className="text-cyan-300">{candidate.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function SettingsView({ onResetRole, onClearSubmitted, onClearShortlisted }) {
  const actions = [
    { label: 'Reset active role', handler: onResetRole },
    { label: 'Clear submitted candidates', handler: onClearSubmitted },
    { label: 'Clear shortlisted candidates', handler: onClearShortlisted }
  ];

  return (
    <SectionCard title="Settings" subtitle="Manage local dashboard state used by the demo application.">
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.handler}
            className="glass-panel p-5 text-left transition hover:border-cyan-400/20 hover:bg-white/10"
          >
            <p className="text-base font-semibold text-white">{action.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Apply this change immediately across the current browser session.</p>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

function RecruiterDashboard({
  state,
  selectedCandidate,
  setSelectedCandidate,
  knownSkills,
  suggestedPrompt,
  onChatbotSubmit,
  onRunMatching,
  activeSection,
  onNavigate,
  allCandidates,
  shortlistedCandidates,
  onToggleShortlist,
  onViewProfile,
  roleDraft,
  onRoleDraftChange,
  onApplyRole,
  candidateSearch,
  onCandidateSearchChange,
  onResetRole,
  onClearSubmitted,
  onClearShortlisted
}) {
  const renderSection = () => {
    if (activeSection === 'Candidates') {
      return (
        <CandidateDirectory
          candidates={allCandidates}
          selectedCandidate={selectedCandidate}
          onSelect={setSelectedCandidate}
          filterText={candidateSearch}
          onFilterTextChange={onCandidateSearchChange}
        />
      );
    }

    if (activeSection === 'Jobs / Roles') {
      return <RolesManager roleDraft={roleDraft} onRoleDraftChange={onRoleDraftChange} onApplyRole={onApplyRole} loading={state.loading} />;
    }

    if (activeSection === 'Shortlisted') {
      return <MatchList matches={shortlistedCandidates} selectedCandidate={selectedCandidate} onSelect={setSelectedCandidate} />;
    }

    if (activeSection === 'Chat Assistant') {
      return (
        <HeroSection
          knownSkills={knownSkills}
          suggestedPrompt={suggestedPrompt}
          onSubmit={onChatbotSubmit}
          loading={state.loading}
          onRunMatching={onRunMatching}
          role={state.role}
        />
      );
    }

    if (activeSection === 'Analytics') {
      return <AnalyticsView matches={state.matches} shortlistedCandidates={shortlistedCandidates} allCandidates={allCandidates} />;
    }

    if (activeSection === 'Settings') {
      return <SettingsView onResetRole={onResetRole} onClearSubmitted={onClearSubmitted} onClearShortlisted={onClearShortlisted} />;
    }

    return (
      <>
        <div className="mb-6 rounded-3xl border border-white/5 bg-dashboard-grid bg-[size:24px_24px] p-[1px]">
          <div className="rounded-3xl bg-transparent">
            <HeroSection
              knownSkills={knownSkills}
              suggestedPrompt={suggestedPrompt}
              onSubmit={onChatbotSubmit}
              loading={state.loading}
              onRunMatching={onRunMatching}
              role={state.role}
            />
          </div>
        </div>
        <div className="space-y-6">
          <StatsCards role={state.role} matches={state.matches} />
          {state.error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {state.error}
            </div>
          ) : null}
          <MatchList matches={state.matches} selectedCandidate={selectedCandidate} onSelect={setSelectedCandidate} />
        </div>
      </>
    );
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_22%),linear-gradient(180deg,#0B0F1A_0%,#0F172A_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1800px] gap-6 px-4 py-6 sm:px-6 xl:px-8">
        <Sidebar
          activeSection={activeSection}
          onNavigate={onNavigate}
          candidateCount={allCandidates.length}
          shortlistedCount={shortlistedCandidates.length}
        />

        <div className="min-w-0 flex-1">
          {renderSection()}
        </div>

        <div className="hidden w-full max-w-[360px] shrink-0 xl:block">
          <CandidatePanel
            candidate={selectedCandidate}
            loading={state.loading}
            isShortlisted={shortlistedCandidates.some((item) => item.id === selectedCandidate?.id)}
            onToggleShortlist={onToggleShortlist}
            onViewProfile={onViewProfile}
          />
        </div>
      </div>
    </main>
  );
}

export default RecruiterDashboard;