export const PEOPLE = ["Sojs", "Trolleroof", "OutcastVirus", "Alexgaoth"] as const;
export type Person = (typeof PEOPLE)[number];

export const PERSON_COLORS: Record<Person, string> = {
  Sojs: "#6366f1",
  Trolleroof: "#ec4899",
  OutcastVirus: "#10b981",
  Alexgaoth: "#f59e0b",
};

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

export const TAG_PALETTE = [
  "#ef4444",
  "#f59e0b",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
];
