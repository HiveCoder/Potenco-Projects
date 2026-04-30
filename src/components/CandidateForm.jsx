import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { saveSubmittedCandidate } from '../candidateStorage.js';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  location: '',
  experience: '',
  preferredRole: '',
  skills: '',
  linkedin: '',
  portfolio: '',
  summary: ''
};

const formatBytes = (bytes) => {
  if (!bytes) {
    return '0 KB';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Unable to read the uploaded resume.'));
    reader.readAsDataURL(file);
  });

const buildLocalCandidate = (payload) => ({
  id: Date.now(),
  name: payload.name.trim(),
  email: payload.email.trim(),
  phone: payload.phone.trim(),
  location: payload.location.trim(),
  experience: Number(payload.experience) || 0,
  preferredRole: payload.preferredRole.trim(),
  linkedin: payload.linkedin.trim(),
  portfolio: payload.portfolio.trim(),
  summary: payload.summary.trim(),
  skills: payload.skills,
  resume: payload.resume,
  source: 'candidate-portal-local'
});

const readResponsePayload = async (response) => {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

function CandidateForm({ knownSkills, onSubmitted }) {
  const [form, setForm] = useState(emptyForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeDataUrl, setResumeDataUrl] = useState('');
  const [resumeTextPreview, setResumeTextPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fileError, setFileError] = useState('');

  const parsedSkills = useMemo(
    () => form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    [form.skills]
  );

  const detectedSkills = useMemo(() => {
    if (parsedSkills.length) {
      return parsedSkills;
    }

    return knownSkills.slice(0, 6);
  }, [parsedSkills, knownSkills]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleSkillsKeyDown = (event) => {
    if (event.key !== ' ' || !form.skills.trim() || /[,\s]$/.test(form.skills)) {
      return;
    }

    event.preventDefault();
    setForm((current) => ({
      ...current,
      skills: `${current.skills.trim()}, `
    }));
  };

  const persistSubmittedCandidate = (candidate) => {
    saveSubmittedCandidate(candidate);
    onSubmitted(candidate);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0] || null;
    setResumeFile(file);
    setResumeDataUrl('');
    setResumeTextPreview('');
    setFileError('');

    if (!file) {
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setFileError('Resume files must be smaller than 4 MB.');
      setResumeFile(null);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setResumeDataUrl(dataUrl);
    } catch {
      setResumeDataUrl('');
    }

    if (file.type.startsWith('text/')) {
      try {
        const text = await file.text();
        setResumeTextPreview(text.slice(0, 1000));
      } catch {
        setResumeTextPreview('');
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!form.name.trim() || !form.email.trim() || !form.location.trim()) {
        throw new Error('Name, email, and location are required.');
      }

      const payload = {
        ...form,
        experience: Number(form.experience) || 0,
        skills: parsedSkills,
        resume: resumeFile ? {
          name: resumeFile.name,
          size: resumeFile.size,
          type: resumeFile.type || 'application/octet-stream',
          previewText: resumeTextPreview,
          dataUrl: resumeDataUrl
        } : null
      };

      const response = await fetch('/api/candidate/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await readResponsePayload(response);

      if (!response.ok) {
        throw new Error(result?.error || 'Unable to submit candidate profile.');
      }

      if (!result?.candidate) {
        const fallbackCandidate = buildLocalCandidate(payload);
        persistSubmittedCandidate(fallbackCandidate);
        setForm(emptyForm);
        setResumeFile(null);
        setResumeDataUrl('');
        setResumeTextPreview('');
        setSuccessMessage('Profile submitted locally. For full API execution during development, run the app with Vercel dev.');
        return;
      }

      persistSubmittedCandidate(result.candidate);
      setForm(emptyForm);
      setResumeFile(null);
      setResumeDataUrl('');
      setResumeTextPreview('');
      setSuccessMessage('Profile submitted successfully and added to the matching pool.');
    } catch (submissionError) {
      const payload = {
        ...form,
        experience: Number(form.experience) || 0,
        skills: parsedSkills,
        resume: resumeFile ? {
          name: resumeFile.name,
          size: resumeFile.size,
          type: resumeFile.type || 'application/octet-stream',
          previewText: resumeTextPreview,
          dataUrl: resumeDataUrl
        } : null
      };

      if (payload.name && payload.location && payload.skills.length) {
        const fallbackCandidate = buildLocalCandidate(payload);
        persistSubmittedCandidate(fallbackCandidate);
        setForm(emptyForm);
        setResumeFile(null);
        setResumeDataUrl('');
        setResumeTextPreview('');
        setSuccessMessage('Profile submitted locally. The Vercel endpoint is unavailable in this dev mode, but your candidate was added to the dataset.');
      } else {
        setError(submissionError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass-panel-strong overflow-hidden p-6 sm:p-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-cyan-200">
            Candidate Portal
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-white">Submit your credentials and resume</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Complete your profile once. The system will add your structured data to the existing talent pool reviewed inside the recruiter workspace.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          Back to home
        </Link>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Full Name</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Alex Morgan"
              required
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Email</span>
            <input
              type="email"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="alex@example.com"
              required
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Phone</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="+1 555 010 2020"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Location</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              value={form.location}
              onChange={handleChange('location')}
              placeholder="Toronto"
              required
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Years of Experience</span>
            <input
              type="number"
              min="0"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              value={form.experience}
              onChange={handleChange('experience')}
              placeholder="3"
              required
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Preferred Role</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              value={form.preferredRole}
              onChange={handleChange('preferredRole')}
              placeholder="Frontend Engineer"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
            <span>Skills</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              value={form.skills}
              onChange={handleChange('skills')}
              onKeyDown={handleSkillsKeyDown}
              placeholder="React, JavaScript, Node.js"
              required
            />
            <div className="flex flex-wrap gap-2 pt-2">
              {(detectedSkills.length ? detectedSkills : knownSkills.slice(0, 6)).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>LinkedIn</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              value={form.linkedin}
              onChange={handleChange('linkedin')}
              placeholder="https://linkedin.com/in/alex"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Portfolio</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              value={form.portfolio}
              onChange={handleChange('portfolio')}
              placeholder="https://alex.dev"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
            <span>Professional Summary</span>
            <textarea
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
              value={form.summary}
              onChange={handleChange('summary')}
              placeholder="Share a concise overview of your recent work, domain expertise, and achievements."
            />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <label className="glass-panel rounded-[28px] border-dashed p-6 text-sm text-slate-300">
            <span className="mb-4 block text-sm font-medium text-white">Resume Upload</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/40 px-6 text-center text-slate-400 transition hover:border-cyan-400/30 hover:bg-slate-950/60">
              <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 text-lg font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                CV
              </span>
              <span className="text-sm font-medium text-slate-200">Drop your resume or click to browse</span>
              <span className="mt-2 text-xs text-slate-500">PDF, DOC, DOCX, or TXT</span>
            </span>
          </label>

          <div className="glass-panel p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Upload Summary</p>
            {resumeFile ? (
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{resumeFile.name}</p>
                  <p className="mt-1 text-slate-400">{resumeFile.type || 'Unknown type'} · {formatBytes(resumeFile.size)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-xs leading-6 text-slate-400">
                  {resumeTextPreview || 'Binary resume uploaded. Metadata will be submitted with your profile.'}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-400">
                No file selected yet. Uploading a resume is optional, but recommended for richer matching context.
              </p>
            )}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {fileError ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {fileError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            {successMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? 'Submitting Profile...' : 'Submit Application'}
          </button>
          <p className="text-sm text-slate-500">Submitted candidates are added to the recruiter matching dataset on this device.</p>
        </div>
      </form>
    </section>
  );
}

export default CandidateForm;