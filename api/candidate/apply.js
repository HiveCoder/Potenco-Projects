const normalizeArray = (value) =>
  (Array.isArray(value) ? value : []).map((item) => String(item).trim()).filter(Boolean);

const normalizeText = (value) => String(value || '').trim();

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const name = normalizeText(req.body?.name);
  const location = normalizeText(req.body?.location);
  const skills = normalizeArray(req.body?.skills);

  if (!name || !location || !skills.length) {
    return res.status(400).json({ error: 'Name, location, and at least one skill are required.' });
  }

  const candidate = {
    id: Date.now(),
    name,
    email: normalizeText(req.body?.email),
    phone: normalizeText(req.body?.phone),
    location,
    experience: Number(req.body?.experience) || 0,
    preferredRole: normalizeText(req.body?.preferredRole),
    linkedin: normalizeText(req.body?.linkedin),
    portfolio: normalizeText(req.body?.portfolio),
    summary: normalizeText(req.body?.summary),
    skills,
    resume: req.body?.resume
      ? {
          name: normalizeText(req.body.resume.name),
          size: Number(req.body.resume.size) || 0,
          type: normalizeText(req.body.resume.type),
          previewText: normalizeText(req.body.resume.previewText)
        }
      : null,
    source: 'candidate-portal'
  };

  return res.status(200).json({
    success: true,
    candidate
  });
}