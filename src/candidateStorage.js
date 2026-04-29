const STORAGE_KEY = 'talenthub-submitted-candidates';
const SHORTLIST_STORAGE_KEY = 'talenthub-shortlisted-candidates';

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

export const loadShortlistedCandidates = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveShortlistedCandidates = (candidates) => {
  if (typeof window === 'undefined') {
    return [];
  }

  window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(candidates));
  return candidates;
};

export const toggleShortlistedCandidate = (candidate) => {
  const current = loadShortlistedCandidates();
  const exists = current.some((item) => item.id === candidate.id);
  const next = exists
    ? current.filter((item) => item.id !== candidate.id)
    : [candidate, ...current];

  saveShortlistedCandidates(next);
  return next;
};

export const clearSubmittedCandidates = () => saveSubmittedCandidates([]);

export const clearShortlistedCandidates = () => saveShortlistedCandidates([]);