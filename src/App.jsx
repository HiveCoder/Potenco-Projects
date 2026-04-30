import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import { clearSubmittedCandidates, loadSubmittedCandidates } from './candidateStorage.js';
import { candidates as seedCandidates, defaultRole, knownSkills, suggestedPrompt } from './data.js';
import { requestJson } from './lib/api.js';
import { buildDisplayCandidate, rankCandidates } from './lib/matching.js';
import CandidatePortal from './pages/CandidatePortal.jsx';
import LandingPage from './pages/LandingPage.jsx';
import RecruiterDashboard from './pages/RecruiterDashboard.jsx';

const initialMatchState = {
  matches: [],
  error: '',
  loading: false,
  role: defaultRole,
  lastPrompt: suggestedPrompt
};

const ADMIN_AUTH_KEY = 'talenthub-admin-auth';

const mergeCandidatePools = (...candidateGroups) => {
  const merged = new Map();

  candidateGroups.flat().forEach((candidate) => {
    if (!candidate || candidate.id === undefined || candidate.id === null) {
      return;
    }

    merged.set(String(candidate.id), candidate);
  });

  return Array.from(merged.values());
};

const decodeBase64ToBytes = (value) => {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const dataUrlToBlob = (dataUrl) => {
  const [header = '', payload = ''] = String(dataUrl || '').split(',', 2);
  const mimeTypeMatch = header.match(/^data:([^;]+)/i);
  const mimeType = mimeTypeMatch?.[1] || 'application/octet-stream';

  if (header.includes(';base64')) {
    return new Blob([decodeBase64ToBytes(payload)], { type: mimeType });
  }

  return new Blob([decodeURIComponent(payload)], { type: mimeType });
};

const openResumeAsset = async (resume) => {
  if (!resume?.dataUrl) {
    return;
  }

  const blob = dataUrlToBlob(resume.dataUrl);
  const blobUrl = URL.createObjectURL(blob);
  const mimeType = blob.type || resume.type || '';
  const canPreviewInBrowser = /^(application\/pdf|text\/|image\/)/.test(mimeType);

  if (canPreviewInBrowser) {
    const previewWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');

    if (previewWindow) {
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      return;
    }
  }

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = resume.name || 'candidate-resume';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
};

function DashboardRoute({ theme, onThemeToggle, onAdminLogout }) {
  const [matchState, setMatchState] = useState(initialMatchState);
  const [candidates, setCandidates] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState('job-default');
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [savingCandidateId, setSavingCandidateId] = useState(null);
  const [roleDraft, setRoleDraft] = useState({
    title: 'Frontend React Developer',
    skills: defaultRole.skills.join(', '),
    experience: String(defaultRole.experience),
    location: defaultRole.location
  });

  const activeJob = jobs.find((job) => job.id === activeJobId) || { title: 'Frontend React Developer', role: defaultRole };

  useEffect(() => {
    setRoleDraft({
      title: activeJob.title,
      skills: activeJob.role.skills.join(', '),
      experience: String(activeJob.role.experience),
      location: activeJob.role.location
    });
  }, [activeJobId, activeJob.title, activeJob.role.experience, activeJob.role.location, JSON.stringify(activeJob.role.skills)]);

  const role = activeJob.role || defaultRole;
  const rankedCandidatesById = useMemo(
    () => new Map(matchState.matches.map((candidate) => [String(candidate.id), candidate])),
    [matchState.matches]
  );
  const displayCandidates = useMemo(
    () => candidates.map((candidate) => buildDisplayCandidate(candidate, role, rankedCandidatesById.get(String(candidate.id)))),
    [candidates, role, rankedCandidatesById]
  );
  const shortlistedCandidates = useMemo(
    () => displayCandidates.filter((candidate) => shortlistedIds.some((id) => String(id) === String(candidate.id))),
    [displayCandidates, shortlistedIds]
  );
  const selectedCandidate =
    displayCandidates.find((candidate) => String(candidate.id) === String(selectedCandidateId)) ||
    shortlistedCandidates.find((candidate) => String(candidate.id) === String(selectedCandidateId)) ||
    displayCandidates[0] ||
    null;

  const loadAppData = async () => {
    const localCandidates = loadSubmittedCandidates();

    try {
      const [candidatesPayload, shortlistPayload, jobsPayload] = await Promise.all([
        requestJson('/api/candidates'),
        requestJson('/api/shortlist'),
        requestJson('/api/jobs')
      ]);

      if (!Array.isArray(candidatesPayload?.candidates)) {
        throw new Error('Candidates API unavailable');
      }

      if (!Array.isArray(shortlistPayload?.shortlistedIds)) {
        throw new Error('Shortlist API unavailable');
      }

      if (!Array.isArray(jobsPayload?.jobs)) {
        throw new Error('Jobs API unavailable');
      }

      setCandidates(mergeCandidatePools(candidatesPayload?.candidates || [], localCandidates));
      setShortlistedIds(shortlistPayload?.shortlistedIds || []);
      setJobs(jobsPayload?.jobs || []);
      setActiveJobId(jobsPayload?.activeJobId || 'job-default');
    } catch {
      setCandidates(mergeCandidatePools(seedCandidates, localCandidates));
      setShortlistedIds([]);
      setJobs([{ id: 'job-default', title: 'Frontend React Developer', role: defaultRole }]);
      setActiveJobId('job-default');
    }
  };

  const runMatching = async (nextRole, prompt = matchState.lastPrompt, candidatePool = candidates) => {
    setMatchState((current) => ({
      ...current,
      loading: true,
      error: '',
      role: nextRole,
      lastPrompt: prompt
    }));

    try {
      const payload = await requestJson('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: nextRole, candidates: candidatePool })
      });

      const matches = payload?.matches || rankCandidates(nextRole, candidatePool);
      setMatchState((current) => ({
        ...current,
        loading: false,
        matches,
        error: ''
      }));
      setSelectedCandidateId(matches[0]?.id || null);
    } catch {
      const matches = rankCandidates(nextRole, candidatePool);
      setMatchState((current) => ({
        ...current,
        loading: false,
        matches,
        error: ''
      }));
      setSelectedCandidateId(matches[0]?.id || null);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key && event.key !== 'talenthub-submitted-candidates') {
        return;
      }

      loadAppData();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (candidates.length) {
      runMatching(role, matchState.lastPrompt, candidates);
    }
  }, [candidates, activeJobId]);

  const handleChatbotSubmit = (prompt, parsedRole) => {
    const normalizedRole = {
      skills: parsedRole.skills,
      experience: parsedRole.experience,
      location: parsedRole.location
    };

    runMatching(normalizedRole, prompt, candidates);
    setActiveSection('Search & Match');
  };

  const handleNavigate = (section) => {
    setActiveSection(section);
    if (section === 'Shortlisted' && shortlistedCandidates.length) {
      setSelectedCandidateId(shortlistedCandidates[0].id);
    }
    if (section === 'Candidates' && displayCandidates.length) {
      setSelectedCandidateId(displayCandidates[0].id);
    }
  };

  const handleToggleShortlist = async (candidate) => {
    const payload = await requestJson('/api/shortlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ candidateId: candidate.id })
    });
    setShortlistedIds(payload.shortlistedIds || []);
    setSelectedCandidateId(candidate.id);
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidateId(candidate.id);
    setActiveSection('Candidates');
  };

  const handleSaveCandidateMeta = async (candidateId, updates) => {
    setSavingCandidateId(candidateId);
    try {
      const payload = await requestJson('/api/candidates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: candidateId, updates })
      });
      setCandidates(payload.candidates || []);
    } finally {
      setSavingCandidateId(null);
    }
  };

  const handleRoleDraftChange = (field, value) => {
    setRoleDraft((current) => ({
      ...current,
      [field]: value
    }));
  };

  const buildRoleFromDraft = () => ({
    skills: roleDraft.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    experience: Number(roleDraft.experience) || 0,
    location: roleDraft.location.trim()
  });

  const handleApplyRole = async () => {
    const nextRole = buildRoleFromDraft();

    await requestJson('/api/jobs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'update',
        id: activeJobId,
        patch: {
          title: roleDraft.title,
          role: nextRole,
          status: 'active'
        }
      })
    });

    setJobs((current) =>
      current.map((job) => (job.id === activeJobId ? { ...job, title: roleDraft.title, role: nextRole, status: 'active' } : job))
    );
    runMatching(nextRole, `Matching ${nextRole.skills.join(', ')} in ${nextRole.location || 'any location'}`, candidates);
    setActiveSection('Search & Match');
  };

  const handleCreateJob = async () => {
    const payload = await requestJson('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: roleDraft.title,
        role: buildRoleFromDraft()
      })
    });
    setJobs(payload.jobs || []);
    setActiveJobId(payload.activeJobId || activeJobId);
    setActiveSection('Jobs / Roles');
  };

  const handleActivateJob = async (jobId) => {
    const payload = await requestJson('/api/jobs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'activate', id: jobId })
    });
    setJobs(payload.jobs || []);
    setActiveJobId(payload.activeJobId || jobId);
  };

  const handleDeleteJob = async (jobId) => {
    const payload = await requestJson('/api/jobs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'delete', id: jobId })
    });
    setJobs(payload.jobs || []);
    setActiveJobId(payload.activeJobId || 'job-default');
  };

  const handleResetRole = async () => {
    await handleActivateJob('job-default');
    setActiveSection('Dashboard');
  };

  const handleClearSubmitted = async () => {
    clearSubmittedCandidates();

    try {
      const payload = await requestJson('/api/candidates', { method: 'DELETE' });
      setCandidates(mergeCandidatePools(payload.candidates || [], loadSubmittedCandidates()));
    } catch {
      setCandidates(mergeCandidatePools(seedCandidates, loadSubmittedCandidates()));
    }
  };

  const handleClearShortlisted = async () => {
    const payload = await requestJson('/api/shortlist', { method: 'DELETE' });
    setShortlistedIds(payload.shortlistedIds || []);
  };

  const handleViewResume = (candidate) => {
    if (!candidate.resume?.dataUrl) {
      return;
    }

    openResumeAsset(candidate.resume);
  };

  return (
    <RecruiterDashboard
      state={matchState}
      selectedCandidate={selectedCandidate}
      setSelectedCandidate={(candidate) => setSelectedCandidateId(candidate.id)}
      knownSkills={knownSkills}
      suggestedPrompt={suggestedPrompt}
      onChatbotSubmit={handleChatbotSubmit}
      onRunMatching={() => runMatching(role, matchState.lastPrompt, candidates)}
      activeSection={activeSection}
      onNavigate={handleNavigate}
      allCandidates={displayCandidates}
      shortlistedCandidates={shortlistedCandidates}
      onToggleShortlist={handleToggleShortlist}
      onViewProfile={handleViewProfile}
      onViewResume={handleViewResume}
      onSaveCandidateMeta={handleSaveCandidateMeta}
      savingCandidateId={savingCandidateId}
      roleDraft={roleDraft}
      onRoleDraftChange={handleRoleDraftChange}
      onApplyRole={handleApplyRole}
      candidateSearch={candidateSearch}
      onCandidateSearchChange={setCandidateSearch}
      onResetRole={handleResetRole}
      onClearSubmitted={handleClearSubmitted}
      onClearShortlisted={handleClearShortlisted}
      theme={theme}
      onThemeToggle={onThemeToggle}
      onReturnHome={onAdminLogout}
      jobs={jobs}
      activeJobId={activeJobId}
      onCreateJob={handleCreateJob}
      onActivateJob={handleActivateJob}
      onDeleteJob={handleDeleteJob}
    />
  );
}

function ApplyRoute({ theme, onThemeToggle }) {
  return <CandidatePortal knownSkills={knownSkills} onSubmitted={() => {}} theme={theme} onThemeToggle={onThemeToggle} />;
}

function LandingRoute({ theme, onThemeToggle, onAdminLogin, isAdminAuthenticated }) {
  return (
    <LandingPage
      theme={theme}
      onThemeToggle={onThemeToggle}
      onAdminLogin={onAdminLogin}
      isAdminAuthenticated={isAdminAuthenticated}
    />
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    return window.localStorage.getItem('talenthub-theme') || 'dark';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('talenthub-theme', theme);
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const handleAdminLogin = ({ identifier, password }) => {
    const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
    const normalizedPassword = String(password || '').trim();

    if (normalizedIdentifier !== 'admin' || normalizedPassword !== 'admin') {
      return false;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    }

    setIsAdminAuthenticated(true);
    return true;
  };

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }

    setIsAdminAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LandingRoute
              theme={theme}
              onThemeToggle={toggleTheme}
              onAdminLogin={handleAdminLogin}
              isAdminAuthenticated={isAdminAuthenticated}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAdminAuthenticated
              ? <DashboardRoute theme={theme} onThemeToggle={toggleTheme} onAdminLogout={handleAdminLogout} />
              : <Navigate to="/" replace />
          }
        />
        <Route path="/apply" element={<ApplyRoute theme={theme} onThemeToggle={toggleTheme} />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);