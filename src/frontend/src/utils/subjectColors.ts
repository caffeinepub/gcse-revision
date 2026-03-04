// Vivid subject card colors with white-readable text
export const SUBJECT_COLORS = [
  {
    bg: "oklch(0.65 0.2 25)",
    light: "oklch(0.95 0.04 25)",
    emoji: "🔢",
    name: "coral",
  },
  {
    bg: "oklch(0.55 0.19 185)",
    light: "oklch(0.94 0.04 185)",
    emoji: "🌊",
    name: "teal",
  },
  {
    bg: "oklch(0.65 0.18 75)",
    light: "oklch(0.95 0.04 75)",
    emoji: "⚗️",
    name: "amber",
  },
  {
    bg: "oklch(0.55 0.22 280)",
    light: "oklch(0.94 0.04 280)",
    emoji: "✨",
    name: "violet",
  },
  {
    bg: "oklch(0.57 0.2 230)",
    light: "oklch(0.94 0.04 230)",
    emoji: "🌐",
    name: "sky",
  },
  {
    bg: "oklch(0.60 0.22 355)",
    light: "oklch(0.95 0.04 355)",
    emoji: "📖",
    name: "rose",
  },
  {
    bg: "oklch(0.55 0.2 155)",
    light: "oklch(0.94 0.04 155)",
    emoji: "🌿",
    name: "emerald",
  },
  {
    bg: "oklch(0.64 0.21 48)",
    light: "oklch(0.95 0.04 48)",
    emoji: "🎨",
    name: "orange",
  },
] as const;

// Assign a color index based on a bigint id (deterministic)
export function getSubjectColor(id: bigint) {
  const idx = Number(id % BigInt(SUBJECT_COLORS.length));
  return SUBJECT_COLORS[idx];
}

// Subject-specific emojis for well-known subjects
const SUBJECT_EMOJIS: Record<string, string> = {
  maths: "📐",
  math: "📐",
  mathematics: "📐",
  english: "📝",
  biology: "🧬",
  chemistry: "⚗️",
  physics: "⚡",
  history: "🏛️",
  geography: "🌍",
  french: "🗼",
  german: "🦅",
  spanish: "💃",
  "computer science": "💻",
  computing: "💻",
  art: "🎨",
  music: "🎵",
  drama: "🎭",
  pe: "⚽",
  "physical education": "⚽",
  rs: "☮️",
  religious: "☮️",
  economics: "📊",
  psychology: "🧠",
  sociology: "👥",
  science: "🔬",
};

export function getSubjectEmoji(name: string, fallback: string): string {
  const key = name.toLowerCase().trim();
  return SUBJECT_EMOJIS[key] ?? fallback;
}
