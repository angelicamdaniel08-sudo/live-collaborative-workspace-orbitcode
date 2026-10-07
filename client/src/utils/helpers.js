export const COLLAB_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#a855f7', // Purple
  '#14b8a6', // Teal
  '#6366f1', // Indigo
];

export const AVATARS = ['⚡', '🚀', '🔮', '👾', '🔥', '🦊', '🎨', '🌟', '💻', '💎'];

export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript (JS)', ext: '.js' },
  { id: 'typescript', label: 'TypeScript (TS)', ext: '.ts' },
  { id: 'python', label: 'Python (PY)', ext: '.py' },
  { id: 'html', label: 'HTML', ext: '.html' },
  { id: 'css', label: 'CSS', ext: '.css' },
  { id: 'json', label: 'JSON', ext: '.json' },
  { id: 'markdown', label: 'Markdown', ext: '.md' },
  { id: 'cpp', label: 'C++', ext: '.cpp' },
];

export const THEMES = [
  { id: 'vs-dark', label: 'VS Dark' },
  { id: 'vs-light', label: 'VS Light' },
  { id: 'hc-black', label: 'High Contrast' },
];

export function getRandomUser() {
  const adjectives = ['Quantum', 'Neon', 'Cosmic', 'Hyper', 'Cyber', 'Solar', 'Pulse', 'Astro', 'Binary', 'Shadow'];
  const nouns = ['Coder', 'Hacker', 'Architect', 'Voyager', 'Pilot', 'Wizard', 'Dev', 'Ninja', 'Engineer', 'Matrix'];

  const randAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randColor = COLLAB_COLORS[Math.floor(Math.random() * COLLAB_COLORS.length)];
  const randAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const randId = `usr_${Math.random().toString(36).substring(2, 9)}`;

  return {
    id: randId,
    username: `${randAdj}${randNoun}`,
    color: randColor,
    avatar: randAvatar,
  };
}

export function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
