import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { loadSubmittedCandidates, saveSubmittedCandidate } from './candidateStorage.js';
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

function App() {
  const [state, setState] = useState(initialState);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [submittedCandidates, setSubmittedCandidates] = useState(() => loadSubmittedCandidates());

  const allCandidates = [...submittedCandidates, ...seedCandidates];
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
  };

  const handleCandidateSubmitted = (candidate) => {
    const next = saveSubmittedCandidate(candidate);
    setSubmittedCandidates(next);
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
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);