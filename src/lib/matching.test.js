import { describe, expect, it } from 'vitest';
import { buildDisplayCandidate, rankCandidates } from './matching.js';

describe('matching', () => {
  it('prioritizes stronger skill alignment', () => {
    const role = { skills: ['React', 'Node.js'], experience: 2, location: 'Toronto' };
    const matches = rankCandidates(role, [
      { id: 1, name: 'A', skills: ['React', 'Node.js'], experience: 3, location: 'Toronto' },
      { id: 2, name: 'B', skills: ['React'], experience: 5, location: 'Toronto' }
    ]);

    expect(matches[0].id).toBe(1);
    expect(matches[0].score).toBeGreaterThan(matches[1].score);
  });

  it('creates fallback display candidates', () => {
    const candidate = buildDisplayCandidate(
      { id: 1, name: 'Alex', skills: ['React'], experience: 2, location: 'Toronto' },
      { skills: ['React', 'Node.js'], experience: 2, location: 'Toronto' }
    );

    expect(candidate.matchedSkills).toContain('React');
    expect(candidate.missingSkills).toContain('Node.js');
    expect(candidate.explanations.length).toBeGreaterThan(0);
  });
});