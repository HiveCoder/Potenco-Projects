import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const platformStats = [
  { value: '3.2x', label: 'faster shortlist reviews' },
  { value: '48h', label: 'average first response window' },
  { value: '92%', label: 'profile completion quality' }
];

const operatingPillars = [
  {
    eyebrow: 'Candidate Intake',
    title: 'A premium application flow built for serious talent.',
    description:
      'Collect structured profiles, resume context, and practical skills in a flow that feels clear, fast, and recruiter-ready.'
  },
  {
    eyebrow: 'Recruiter Operations',
    title: 'A private workspace for ranking, reviewing, and deciding.',
    description:
      'Recruiters get a separate environment for candidate scoring, workflow notes, and job-based matching without exposing internal tools.'
  }
];

const featureColumns = [
  {
    title: 'Signal-rich profiles',
    copy: 'Capture skills, experience, location, resume context, and supporting links in one structured candidate record.'
  },
  {
    title: 'Explainable matching',
    copy: 'Show why a profile ranks well with visible matched skills, missing skills, and role-fit reasoning.'
  },
  {
    title: 'Clean stakeholder separation',
    copy: 'Candidates see a polished application portal while employers stay inside a focused recruiter dashboard.'
  }
];

const workflowSteps = [
  'Candidates submit a structured profile and optional CV through a dedicated intake experience.',
  'TalentHub normalizes profile data into a candidate pool ready for recruiter review and comparison.',
  'Recruiters rank, inspect, shortlist, and manage candidates inside a protected workspace.'
];

function LandingPage({ theme, onThemeToggle, onAdminLogin, isAdminAuthenticated }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const surfaceClass = theme === 'dark'
    ? 'bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_22%),radial-gradient(circle_at_80%_10%,rgba(8,145,178,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.12),transparent_26%),linear-gradient(180deg,#07111f_0%,#0d1726_48%,#111827_100%)] text-slate-100'
    : 'bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_22%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.1),transparent_26%),linear-gradient(180deg,#fffdf8_0%,#f3f8fb_46%,#eef7f2_100%)] text-slate-900';

  const handleEmployerLogin = (event) => {
    event.preventDefault();

    const success = onAdminLogin({ identifier, password });

    if (!success) {
      setAuthError('Invalid credentials. Use admin for both the username and password for this test flow.');
      return;
    }

    setAuthError('');
    navigate('/dashboard');
  };

  return (
    <main className={['min-h-screen', surfaceClass].join(' ')}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 xl:px-8">
        <div className="glass-panel-strong relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">TalentHub Platform</p>
              <h1 className="display-font mt-2 max-w-4xl text-[2rem] font-semibold leading-[1.12] text-white sm:text-4xl sm:leading-[1.08]">Modern talent operations, from first application to final shortlist.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                A more professional hiring front end for candidates and a cleaner decision workspace for employer teams.
              </p>
            </div>
            <button
              type="button"
              onClick={onThemeToggle}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <div className="glass-panel-strong relative overflow-hidden p-8 sm:p-10 xl:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_24%),radial-gradient(circle_at_88%_16%,rgba(6,182,212,0.16),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] lg:block" />
            <div className="relative">
              <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-orange-200">
                Talent Intelligence Layer
              </span>
              <h2 className="display-font mt-5 max-w-4xl text-[2.5rem] font-semibold leading-[1.08] text-white sm:text-5xl xl:text-6xl">
                Build a hiring homepage that feels credible, premium, and operationally sharp.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                TalentHub gives candidates a confident first impression and gives employers a clean path into a recruiter workspace built around role fit, hiring signal, and faster decision cycles.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/apply"
                  className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(249,115,22,0.24)] transition hover:-translate-y-0.5 sm:w-auto"
                >
                  Candidate portal
                </Link>
                <button
                  type="button"
                  onClick={() => navigate(isAdminAuthenticated ? '/dashboard' : '#employer-access')}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 sm:w-auto"
                >
                  {isAdminAuthenticated ? 'Enter recruiter workspace' : 'Employer access'}
                </button>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {platformStats.map((item) => (
                  <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-black/10 p-5 backdrop-blur-sm">
                    <p className="text-3xl font-semibold text-white sm:text-4xl">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 space-y-4">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Why It Feels Stronger</p>
                  <div className="mt-5 space-y-4">
                    {featureColumns.map((feature) => (
                      <div key={feature.title} className="min-w-0 rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-4">
                        <p className="text-base font-semibold text-white">{feature.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{feature.copy}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-cyan-300/10 bg-slate-950/35 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">Hiring Flow</p>
                  <div className="mt-4 space-y-4">
                    {workflowSteps.map((step, index) => (
                      <div key={step} className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-semibold text-cyan-200">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-6 text-slate-300">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section id="employer-access" className="glass-panel-strong rounded-[2rem] p-7">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Employer Access</p>
                <h3 className="mt-3 text-2xl font-semibold leading-snug text-white">Recruiter workspace sign in</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Enter the hiring workspace to review ranked profiles, check resume context, manage roles, and keep recruiter workflow notes in one place.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleEmployerLogin}>
                <label className="block space-y-2 text-sm text-slate-300">
                  <span>Username or email</span>
                  <input
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                    placeholder="admin"
                    autoComplete="username"
                  />
                </label>

                <label className="block space-y-2 text-sm text-slate-300">
                  <span>Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
                    placeholder="admin"
                    autoComplete="current-password"
                  />
                </label>

                {authError ? (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                    {authError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(14,165,233,0.24)] transition hover:scale-[1.01]"
                  >
                    Sign in to dashboard
                  </button>
                  <p className="text-xs leading-5 text-slate-400">
                    Test credentials: <span className="font-semibold text-slate-200">admin</span> / <span className="font-semibold text-slate-200">admin</span>
                  </p>
                </div>
              </form>

              {isAdminAuthenticated ? (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200"
                >
                  Continue to dashboard
                </button>
              ) : null}
            </section>

            {operatingPillars.map((pillar) => (
              <section key={pillar.title} className="glass-panel-strong rounded-[2rem] p-7">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">{pillar.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{pillar.description}</p>
              </section>
            ))}

            <Link
              to="/apply"
              className="glass-panel-strong block rounded-[2rem] overflow-hidden p-7 transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">For Candidates</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-snug text-white">Open the application portal</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Submit profile details, attach a resume, and enter the active talent pipeline with a cleaner intake experience.
                  </p>
                </div>
                <div className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Live intake
                </div>
              </div>
              <div className="mt-6 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                Start application
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LandingPage;