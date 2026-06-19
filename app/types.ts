export const PEOPLE = ["Sojs", "Trolleroof", "OutcastVirus", "Alexgaoth"] as const;
export type Person = (typeof PEOPLE)[number];

// Monochrome theme: people are distinguished by grayscale shades.
export const PERSON_COLORS: Record<Person, string> = {
  Sojs: "#ffffff",
  Trolleroof: "#b5b5b5",
  OutcastVirus: "#7a7a7a",
  Alexgaoth: "#4a4a4a",
};

// Returns black or white depending on which contrasts better with `hex`.
export function contrastText(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}

export type Tag = {
  id: string;
  label: string;
  color: string;
};

export type Card = {
  id: string;
  title: string;
  description: string;
  assignees: Person[];
  deadline: string | null; // ISO date string (yyyy-mm-dd) or null
  tagIds: string[];
  createdAt: number;
};

export type Column = {
  id: string;
  title: string;
  cardIds: string[];
};

export type Board = {
  columns: Column[];
  cards: Record<string, Card>;
  tags: Tag[];
};

// Grayscale "colors" for tags — light to dark.
export const TAG_PALETTE = [
  "#ffffff",
  "#d4d4d4",
  "#a3a3a3",
  "#7a7a7a",
  "#525252",
  "#3a3a3a",
  "#262626",
];
