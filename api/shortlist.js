import { clearShortlisted, getShortlistedIds, toggleShortlist } from './_lib/store.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ shortlistedIds: await getShortlistedIds() });
  }

  if (req.method === 'POST') {
    return res.status(200).json({ shortlistedIds: await toggleShortlist(req.body?.candidateId) });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ shortlistedIds: await clearShortlisted() });
  }

  res.setHeader('Allow', 'GET,POST,DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}