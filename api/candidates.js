import { clearSubmittedCandidatesStore, getCandidates, updateCandidate } from './_lib/store.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ candidates: await getCandidates() });
  }

  if (req.method === 'PUT') {
    const candidate = await updateCandidate(req.body?.id, req.body?.updates || {});
    return res.status(200).json({ candidate, candidates: await getCandidates() });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ candidates: await clearSubmittedCandidatesStore() });
  }

  res.setHeader('Allow', 'GET,PUT,DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}