import { head, put } from '@vercel/blob';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { candidates as seedCandidates, defaultRole } from '../../src/data.js';

const LOCAL_STORE_PATH = path.join(process.cwd(), '.data', 'talenthub-store.json');
const BLOB_PATH = 'talenthub-store.json';

const createDefaultJob = () => ({
  id: 'job-default',
  title: 'Frontend React Developer',
  role: defaultRole,
  status: 'active',
  createdAt: new Date().toISOString()
});

const createDefaultStore = () => ({
  submittedCandidates: [],
  candidateMeta: {},
  shortlistedIds: [],
  jobs: [createDefaultJob()],
  activeJobId: 'job-default'
});

const getSeedCandidates = () =>
  seedCandidates.map((candidate) => ({
    ...candidate,
    status: 'Applied',
    notes: '',
    source: 'seed'
  }));

const normalizeStore = (value) => {
  const base = createDefaultStore();

  return {
    ...base,
    ...value,
    submittedCandidates: Array.isArray(value?.submittedCandidates) ? value.submittedCandidates : [],
    candidateMeta: value?.candidateMeta && typeof value.candidateMeta === 'object' ? value.candidateMeta : {},
    shortlistedIds: Array.isArray(value?.shortlistedIds) ? value.shortlistedIds : [],
    jobs: Array.isArray(value?.jobs) && value.jobs.length ? value.jobs : base.jobs,
    activeJobId: value?.activeJobId || base.activeJobId
  };
};

const readLocalStore = async () => {
  try {
    const raw = await readFile(LOCAL_STORE_PATH, 'utf8');
    return normalizeStore(JSON.parse(raw));
  } catch {
    return createDefaultStore();
  }
};

const readBlobStore = async () => {
  try {
    const blob = await head(BLOB_PATH);
    const response = await fetch(blob.url);

    if (!response.ok) {
      return null;
    }

    return normalizeStore(await response.json());
  } catch {
    return null;
  }
};

const writeLocalStore = async (store) => {
  await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  await writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
};

export const readStore = async () => {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blobStore = await readBlobStore();

    if (blobStore) {
      return blobStore;
    }
  }

  return readLocalStore();
};

export const writeStore = async (store) => {
  const normalized = normalizeStore(store);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put(BLOB_PATH, JSON.stringify(normalized, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json'
      });
    } catch {
      await writeLocalStore(normalized);
      return normalized;
    }
  }

  await writeLocalStore(normalized);
  return normalized;
};

const applyCandidateMeta = (candidate, meta = {}) => ({
  status: 'Applied',
  notes: '',
  ...candidate,
  ...meta
});

export const getCandidates = async () => {
  const store = await readStore();
  return [...getSeedCandidates(), ...store.submittedCandidates].map((candidate) =>
    applyCandidateMeta(candidate, store.candidateMeta[candidate.id])
  );
};

export const createCandidate = async (candidate) => {
  const store = await readStore();
  const nextCandidate = {
    id: `candidate-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: 'candidate-portal',
    status: 'Applied',
    notes: '',
    ...candidate
  };

  store.submittedCandidates = [nextCandidate, ...store.submittedCandidates];
  store.candidateMeta[nextCandidate.id] = {
    status: nextCandidate.status,
    notes: nextCandidate.notes
  };

  await writeStore(store);
  return nextCandidate;
};

export const updateCandidate = async (id, updates) => {
  const store = await readStore();
  store.candidateMeta[id] = {
    ...(store.candidateMeta[id] || {}),
    ...(updates.status ? { status: updates.status } : {}),
    ...(typeof updates.notes === 'string' ? { notes: updates.notes } : {})
  };
  await writeStore(store);
  return (await getCandidates()).find((candidate) => String(candidate.id) === String(id));
};

export const clearSubmittedCandidatesStore = async () => {
  const store = await readStore();
  const submittedIds = new Set(store.submittedCandidates.map((candidate) => String(candidate.id)));
  store.submittedCandidates = [];
  store.shortlistedIds = store.shortlistedIds.filter((id) => !submittedIds.has(String(id)));

  Object.keys(store.candidateMeta).forEach((candidateId) => {
    if (submittedIds.has(String(candidateId))) {
      delete store.candidateMeta[candidateId];
    }
  });

  await writeStore(store);
  return getCandidates();
};

export const getShortlistedIds = async () => {
  const store = await readStore();
  return store.shortlistedIds;
};

export const toggleShortlist = async (candidateId) => {
  const store = await readStore();
  const normalizedId = String(candidateId);
  const exists = store.shortlistedIds.some((id) => String(id) === normalizedId);
  store.shortlistedIds = exists
    ? store.shortlistedIds.filter((id) => String(id) !== normalizedId)
    : [candidateId, ...store.shortlistedIds];
  await writeStore(store);
  return store.shortlistedIds;
};

export const clearShortlisted = async () => {
  const store = await readStore();
  store.shortlistedIds = [];
  await writeStore(store);
  return [];
};

export const getJobs = async () => {
  const store = await readStore();
  const activeJob = store.jobs.find((job) => job.id === store.activeJobId) || store.jobs[0];
  return {
    jobs: store.jobs,
    activeJobId: activeJob.id,
    activeJob
  };
};

export const createJob = async ({ title, role }) => {
  const store = await readStore();
  const nextJob = {
    id: `job-${Date.now()}`,
    title: title || 'Untitled Role',
    role,
    status: 'draft',
    createdAt: new Date().toISOString()
  };

  store.jobs = [nextJob, ...store.jobs];
  store.activeJobId = nextJob.id;
  await writeStore(store);
  return getJobs();
};

export const mutateJob = async ({ action, id, patch }) => {
  const store = await readStore();

  if (action === 'activate') {
    const target = store.jobs.find((job) => job.id === id);
    if (!target) {
      throw new Error('Job not found');
    }

    store.activeJobId = id;
    store.jobs = store.jobs.map((job) => ({
      ...job,
      status: job.id === id ? 'active' : job.status === 'active' ? 'draft' : job.status
    }));
  }

  if (action === 'update') {
    store.jobs = store.jobs.map((job) =>
      job.id === id
        ? {
            ...job,
            ...patch,
            role: patch?.role || job.role
          }
        : job
    );
  }

  if (action === 'delete') {
    store.jobs = store.jobs.filter((job) => job.id !== id);
    if (!store.jobs.length) {
      store.jobs = [createDefaultJob()];
    }
    if (!store.jobs.some((job) => job.id === store.activeJobId)) {
      store.activeJobId = store.jobs[0].id;
    }
  }

  await writeStore(store);
  return getJobs();
};