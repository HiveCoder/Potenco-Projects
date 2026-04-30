import { createJob, getJobs, mutateJob } from './_lib/store.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(await getJobs());
  }

  if (req.method === 'POST') {
    return res.status(200).json(
      await createJob({
        title: req.body?.title,
        role: req.body?.role || { skills: [], experience: 0, location: '' }
      })
    );
  }

  if (req.method === 'PUT') {
    return res.status(200).json(
      await mutateJob({
        action: req.body?.action,
        id: req.body?.id,
        patch: req.body?.patch
      })
    );
  }

  res.setHeader('Allow', 'GET,POST,PUT');
  return res.status(405).json({ error: 'Method not allowed' });
}