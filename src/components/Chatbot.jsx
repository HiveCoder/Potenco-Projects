import { useState } from 'react';

const normalizeSkill = (skill) => skill.toLowerCase().replace(/[^a-z0-9]/g, '');

const buildSkillMap = (skills) =>
  skills.reduce((map, skill) => {
    map[normalizeSkill(skill)] = skill;
    return map;
  }, {});

const parseExperience = (text) => {
  const match = text.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i);
  return match ? Number(match[1]) : 0;
};

const parseLocation = (text) => {
  const match = text.match(/\bin\s+([a-zA-Z\s-]+?)(?:[.!?]|$)/i);
  return match ? match[1].trim().replace(/\b(remote)\b/i, 'Remote') : '';
};

const parseSkills = (text, knownSkills) => {
  const lowerText = text.toLowerCase();
  const skillMap = buildSkillMap(knownSkills);

  return knownSkills.filter((skill) => {
    const normalized = normalizeSkill(skill);
    const aliases = [skill.toLowerCase(), normalized];

    if (normalized === 'nodejs') {
      aliases.push('node', 'node js');
    }

    if (normalized === 'restapis') {
      aliases.push('rest api', 'api');
    }

    return aliases.some((alias) => lowerText.includes(alias));
  }).map((skill) => skillMap[normalizeSkill(skill)]);
};

export const parsePrompt = (prompt, knownSkills) => ({
  skills: parseSkills(prompt, knownSkills),
  experience: parseExperience(prompt),
  location: parseLocation(prompt)
});

function Chatbot({ knownSkills, suggestedPrompt, onSubmit, loading }) {
  const [prompt, setPrompt] = useState(suggestedPrompt);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(prompt, parsePrompt(prompt, knownSkills));
  };

  return (
    <section className="glass-panel relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_36%)]" />
      <div className="relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-purple-200">
              Chat Assistant
            </span>
            <h3 className="mt-4 text-xl font-semibold text-white">Describe the role in natural language</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{suggestedPrompt}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            Parser Active
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="job-prompt">
            Role description
          </label>
          <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-slate-950/60 p-3 backdrop-blur-xl shadow-[0_0_20px_rgba(99,102,241,0.12)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              AI
            </div>
            <input
              id="job-prompt"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              type="text"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Looking for a React developer with 2 years experience in Toronto"
            />
            <button
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-70"
              type="submit"
              disabled={loading}
              aria-label="Submit role prompt"
            >
              {loading ? '...' : '➜'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Toronto', 'Remote', 'Full-time'].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
              >
                {chip}
              </span>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}

export default Chatbot;