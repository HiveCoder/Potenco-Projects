import { rankCandidates } from '../src/lib/matching.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const role = req.body?.role || {};
  const candidates = Array.isArray(req.body?.candidates) ? req.body.candidates : [];

  if (!candidates.length) {
    return res.status(400).json({ error: 'Candidates array is required.' });
  }

  const matches = rankCandidates(role, candidates);

  return res.status(200).json({ matches });
}