import CandidateForm from '../components/CandidateForm.jsx';

function CandidatePortal({ knownSkills, onSubmitted }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_22%),linear-gradient(180deg,#0B0F1A_0%,#0F172A_100%)] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 xl:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_320px]">
          <section className="glass-panel-strong relative overflow-hidden p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_28%)]" />
            <div className="relative">
              <span className="inline-flex rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-purple-200">
                Apply to TalentHub
              </span>
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                Put your profile in front of recruiters, <span className="text-gradient">faster</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Submit your credentials, upload your resume, and make your profile available to the same matching engine powering the recruiter dashboard.
              </p>
            </div>
          </section>

          <section className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">What happens next</p>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">1. Your structured profile is submitted through a Vercel serverless endpoint.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">2. The profile is added to the local recruiter candidate pool used for matching.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">3. Recruiters can immediately evaluate your fit against active roles.</div>
            </div>
          </section>
        </div>

        <CandidateForm knownSkills={knownSkills} onSubmitted={onSubmitted} />
      </div>
    </main>
  );
}

export default CandidatePortal;