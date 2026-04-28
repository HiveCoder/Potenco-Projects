const normalizeText = (value) => String(value || '').trim().toLowerCase();

const uniqueSkills = (skills) =>
  Array.from(new Set((Array.isArray(skills) ? skills : []).map((skill) => String(skill).trim()).filter(Boolean)));

const getMatchedSkills = (roleSkills, candidateSkills) => {
  const normalizedCandidateSkills = new Set(candidateSkills.map((skill) => normalizeText(skill)));
  return roleSkills.filter((skill) => normalizedCandidateSkills.has(normalizeText(skill)));
};

const scoreSkills = (roleSkills, matchedSkills) => {
  if (!roleSkills.length) {
    return 40;
  }

  return Math.round((matchedSkills.length / roleSkills.length) * 60);
};

const scoreExperience = (requiredExperience, candidateExperience) => {
  if (!requiredExperience) {
    return 25;
  }

  if (candidateExperience >= requiredExperience) {
    const surplus = Math.min(candidateExperience - requiredExperience, 3);
    return Math.min(25, 20 + surplus * 2);
  }

  const ratio = Math.max(candidateExperience, 0) / requiredExperience;
  return Math.round(ratio * 20);
};

const scoreLocation = (roleLocation, candidateLocation) => {
  if (!roleLocation) {
    return 15;
  }

  return normalizeText(roleLocation) === normalizeText(candidateLocation) ? 15 : 0;
};

const buildExplanations = ({ matchedSkills, missingSkills, role, candidate, locationMatched }) => {
  const explanations = [];

  if (matchedSkills.length) {
    explanations.push(`Matched key skills: ${matchedSkills.join(', ')}.`);
  } else {
    explanations.push('No required skills were matched.');
  }

  if (missingSkills.length) {
    explanations.push(`Missing requested skills: ${missingSkills.join(', ')}.`);
  }

  if (role.experience) {
    if (candidate.experience >= role.experience) {
      explanations.push(`Experience meets requirement with ${candidate.experience} years.`);
    } else {
      explanations.push(`Experience is below target: ${candidate.experience} of ${role.experience} years.`);
    }
  }

  explanations.push(
    locationMatched
      ? `Location aligns with ${role.location}.`
      : role.location
        ? `Location differs from requested ${role.location}.`
        : 'No location preference supplied.'
  );

  return explanations;
};

const rankCandidates = (role, candidates) => {
  const normalizedRole = {
    skills: uniqueSkills(role.skills),
    experience: Number(role.experience) || 0,
    location: String(role.location || '').trim()
  };

  return candidates
    .map((candidate) => {
      const candidateSkills = uniqueSkills(candidate.skills);
      const matchedSkills = getMatchedSkills(normalizedRole.skills, candidateSkills);
      const missingSkills = normalizedRole.skills.filter(
        (skill) => !matchedSkills.some((matched) => normalizeText(matched) === normalizeText(skill))
      );
      const locationMatched =
        !normalizedRole.location ||
        normalizeText(normalizedRole.location) === normalizeText(candidate.location);

      const skillScore = scoreSkills(normalizedRole.skills, matchedSkills);
      const experienceScore = scoreExperience(normalizedRole.experience, Number(candidate.experience) || 0);
      const locationScore = scoreLocation(normalizedRole.location, candidate.location);
      const totalScore = Math.min(100, skillScore + experienceScore + locationScore);

      return {
        ...candidate,
        score: totalScore,
        matchedSkills,
        missingSkills,
        explanations: buildExplanations({
          matchedSkills,
          missingSkills,
          role: normalizedRole,
          candidate,
          locationMatched
        })
      };
    })
    .sort((left, right) => right.score - left.score);
};

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