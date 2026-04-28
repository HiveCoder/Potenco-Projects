const STORAGE_KEY = 'talenthub-submitted-candidates';

export const loadSubmittedCandidates = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveSubmittedCandidate = (candidate) => {
  if (typeof window === 'undefined') {
    return [];
  }

  const current = loadSubmittedCandidates();
  const next = [candidate, ...current.filter((item) => item.id !== candidate.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};