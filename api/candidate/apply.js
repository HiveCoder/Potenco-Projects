import { createCandidate } from '../_lib/store.js';
import { knownSkills } from '../../src/data.js';

const normalizeArray = (value) =>
  (Array.isArray(value) ? value : []).map((item) => String(item).trim()).filter(Boolean);

const normalizeText = (value) => String(value || '').trim();

const inferSkills = (text) => {
  const source = normalizeText(text).toLowerCase();
  return knownSkills.filter((skill) => source.includes(skill.toLowerCase()));
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const name = normalizeText(req.body?.name);
  const location = normalizeText(req.body?.location);
  const inferredSkills = inferSkills(`${req.body?.summary || ''} ${req.body?.resume?.previewText || ''}`);
  const skills = Array.from(new Set([...normalizeArray(req.body?.skills), ...inferredSkills]));

  if (!name || !location || !skills.length) {
    return res.status(400).json({ error: 'Name, location, and at least one skill are required.' });
  }

  const candidate = await createCandidate({
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
          previewText: normalizeText(req.body.resume.previewText),
          dataUrl: normalizeText(req.body.resume.dataUrl)
        }
      : null,
    status: 'Applied',
    notes: ''
  });

  return res.status(200).json({
    success: true,
    candidate
  });
}