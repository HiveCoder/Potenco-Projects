import CandidatePanel from '../components/CandidatePanel.jsx';
import HeroSection from '../components/HeroSection.jsx';
import MatchList from '../components/MatchList.jsx';
import Sidebar from '../components/Sidebar.jsx';
import StatsCards from '../components/StatsCards.jsx';

function RecruiterDashboard({ state, selectedCandidate, setSelectedCandidate, knownSkills, suggestedPrompt, onChatbotSubmit, onRunMatching }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_22%),linear-gradient(180deg,#0B0F1A_0%,#0F172A_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1800px] gap-6 px-4 py-6 sm:px-6 xl:px-8">
        <Sidebar />

        <div className="min-w-0 flex-1">
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

            <MatchList
              matches={state.matches}
              selectedCandidate={selectedCandidate}
              onSelect={setSelectedCandidate}
            />
          </div>
        </div>

        <div className="hidden w-full max-w-[360px] shrink-0 xl:block">
          <CandidatePanel candidate={selectedCandidate} loading={state.loading} />
        </div>
      </div>
    </main>
  );
}

export default RecruiterDashboard;