export const normalizeText = (value) => String(value || '').trim().toLowerCase();

export const uniqueSkills = (skills) =>
  Array.from(new Set((Array.isArray(skills) ? skills : []).map((skill) => String(skill).trim()).filter(Boolean)));

export const getMatchedSkills = (roleSkills, candidateSkills) => {
  const normalizedCandidateSkills = new Set(candidateSkills.map((skill) => normalizeText(skill)));
  return roleSkills.filter((skill) => normalizedCandidateSkills.has(normalizeText(skill)));
};

export const scoreSkills = (roleSkills, matchedSkills) => {
  if (!roleSkills.length) {
    return 40;
  }

  return Math.round((matchedSkills.length / roleSkills.length) * 60);
};

export const scoreExperience = (requiredExperience, candidateExperience) => {
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

export const scoreLocation = (roleLocation, candidateLocation) => {
  if (!roleLocation) {
    return 15;
  }

  return normalizeText(roleLocation) === normalizeText(candidateLocation) ? 15 : 0;
};

export const buildExplanations = ({ matchedSkills, missingSkills, role, candidate, locationMatched }) => {
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

export const rankCandidates = (role, candidates) => {
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
        !normalizedRole.location || normalizeText(normalizedRole.location) === normalizeText(candidate.location);

      const score = Math.min(
        100,
        scoreSkills(normalizedRole.skills, matchedSkills) +
          scoreExperience(normalizedRole.experience, Number(candidate.experience) || 0) +
          scoreLocation(normalizedRole.location, candidate.location)
      );

      return {
        ...candidate,
        score,
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

export const buildDisplayCandidate = (candidate, role, rankedCandidate) => {
  if (rankedCandidate) {
    return rankedCandidate;
  }

  return rankCandidates(role, [candidate])[0];
};