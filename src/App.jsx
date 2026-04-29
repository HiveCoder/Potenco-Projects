import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  clearShortlistedCandidates,
  clearSubmittedCandidates,
  loadShortlistedCandidates,
  loadSubmittedCandidates,
  saveSubmittedCandidate,
  toggleShortlistedCandidate
} from './candidateStorage.js';
import { candidates as seedCandidates, defaultRole, knownSkills, suggestedPrompt } from './data.js';
import CandidatePortal from './pages/CandidatePortal.jsx';
import RecruiterDashboard from './pages/RecruiterDashboard.jsx';

const initialState = {
  matches: [],
  error: '',
  loading: false,
  role: defaultRole,
  lastPrompt: suggestedPrompt
};

const buildDisplayCandidate = (candidate, role, rankedCandidate) => {
  const normalizedSkills = Array.isArray(candidate.skills) ? candidate.skills : [];

  if (rankedCandidate) {
    return rankedCandidate;
  }

  const matchedSkills = normalizedSkills.filter((skill) =>
    role.skills.some((requiredSkill) => requiredSkill.toLowerCase() === String(skill).toLowerCase())
  );
  const missingSkills = role.skills.filter(
    (requiredSkill) => !matchedSkills.some((skill) => skill.toLowerCase() === requiredSkill.toLowerCase())
  );
  const locationMatched = !role.location || String(candidate.location).toLowerCase() === role.location.toLowerCase();
  const skillRatio = role.skills.length ? matchedSkills.length / role.skills.length : 1;
  const experienceRatio = role.experience ? Math.min((candidate.experience || 0) / role.experience, 1) : 1;
  const score = Math.round(skillRatio * 60 + experienceRatio * 25 + (locationMatched ? 15 : 0));

  return {
    ...candidate,
    score,
    matchedSkills,
    missingSkills,
    explanations: [
      matchedSkills.length
        ? `Matched skills: ${matchedSkills.join(', ')}.`
        : 'No direct skill matches for the current role.',
      role.experience
        ? `Experience alignment: ${candidate.experience || 0} years against ${role.experience} required.`
        : 'No experience threshold set for the active role.',
      locationMatched
        ? `Location aligns with ${role.location || 'the current search'}.`
        : `Location differs from ${role.location}.`
    ]
  };
};

function App() {
  const [state, setState] = useState(initialState);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [submittedCandidates, setSubmittedCandidates] = useState(() => loadSubmittedCandidates());
  const [shortlistedCandidates, setShortlistedCandidates] = useState(() => loadShortlistedCandidates());
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [roleDraft, setRoleDraft] = useState({
    skills: defaultRole.skills.join(', '),
    experience: String(defaultRole.experience),
    location: defaultRole.location
  });

  const allCandidates = [...submittedCandidates, ...seedCandidates];
  const rankedCandidatesById = new Map(state.matches.map((candidate) => [candidate.id, candidate]));
  const displayCandidates = allCandidates.map((candidate) =>
    buildDisplayCandidate(candidate, state.role, rankedCandidatesById.get(candidate.id))
  );
  const isApplyPage = typeof window !== 'undefined' && window.location.pathname === '/apply';

  const runMatching = async (role, prompt = state.lastPrompt) => {
    setState((current) => ({
      ...current,
      loading: true,
      error: '',
      role,
      lastPrompt: prompt
    }));

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role, candidates: allCandidates })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to run candidate matching.');
      }

      setState((current) => ({
        ...current,
        loading: false,
        matches: payload.matches,
        error: ''
      }));
      setSelectedCandidate(payload.matches[0] || null);
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        matches: [],
        error: error.message
      }));
    }
  };

  useEffect(() => {
    runMatching(defaultRole, suggestedPrompt);
  }, []);

  useEffect(() => {
    if (!isApplyPage) {
      runMatching(state.role, state.lastPrompt);
    }
  }, [submittedCandidates]);

  const handleChatbotSubmit = (prompt, parsedRole) => {
    const normalizedRole = {
      skills: parsedRole.skills,
      experience: parsedRole.experience,
      location: parsedRole.location
    };

    runMatching(normalizedRole, prompt);
    setActiveSection('Search & Match');
  };

  const handleCandidateSubmitted = (candidate) => {
    const next = saveSubmittedCandidate(candidate);
    setSubmittedCandidates(next);
  };

  const handleToggleShortlist = (candidate) => {
    const next = toggleShortlistedCandidate(candidate);
    setShortlistedCandidates(next);
    setSelectedCandidate(candidate);
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setActiveSection('Candidates');
  };

  const handleRoleDraftChange = (field, value) => {
    setRoleDraft((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleApplyRole = () => {
    const normalizedRole = {
      skills: roleDraft.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      experience: Number(roleDraft.experience) || 0,
      location: roleDraft.location.trim()
    };

    runMatching(normalizedRole, `Matching ${normalizedRole.skills.join(', ')} in ${normalizedRole.location || 'any location'}`);
    setActiveSection('Search & Match');
  };

  const handleResetRole = () => {
    setRoleDraft({
      skills: defaultRole.skills.join(', '),
      experience: String(defaultRole.experience),
      location: defaultRole.location
    });
    runMatching(defaultRole, suggestedPrompt);
    setActiveSection('Dashboard');
  };

  const handleClearSubmitted = () => {
    setSubmittedCandidates(clearSubmittedCandidates());
  };

  const handleClearShortlisted = () => {
    setShortlistedCandidates(clearShortlistedCandidates());
  };

  const handleNavigate = (section) => {
    setActiveSection(section);

    if (section === 'Shortlisted' && shortlistedCandidates.length) {
      setSelectedCandidate(shortlistedCandidates[0]);
    }

    if (section === 'Candidates' && displayCandidates.length) {
      setSelectedCandidate(displayCandidates[0]);
    }
  };

  if (isApplyPage) {
    return <CandidatePortal knownSkills={knownSkills} onSubmitted={handleCandidateSubmitted} />;
  }

  return (
    <RecruiterDashboard
      state={state}
      selectedCandidate={selectedCandidate}
      setSelectedCandidate={setSelectedCandidate}
      knownSkills={knownSkills}
      suggestedPrompt={suggestedPrompt}
      onChatbotSubmit={handleChatbotSubmit}
      onRunMatching={() => runMatching(state.role, state.lastPrompt)}
      activeSection={activeSection}
      onNavigate={handleNavigate}
      allCandidates={displayCandidates}
      shortlistedCandidates={shortlistedCandidates}
      onToggleShortlist={handleToggleShortlist}
      onViewProfile={handleViewProfile}
      roleDraft={roleDraft}
      onRoleDraftChange={handleRoleDraftChange}
      onApplyRole={handleApplyRole}
      candidateSearch={candidateSearch}
      onCandidateSearchChange={setCandidateSearch}
      onResetRole={handleResetRole}
      onClearSubmitted={handleClearSubmitted}
      onClearShortlisted={handleClearShortlisted}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);