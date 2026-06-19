import { Board } from "./types";

// Server- and client-safe helpers (no window / localStorage access here).

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function defaultBoard(): Board {
  const t1 = uid();
  const t2 = uid();
  const t3 = uid();
  const t4 = uid();

  const c1 = uid();
  const c2 = uid();
  const c3 = uid();

  const todo = uid();
  const doing = uid();
  const done = uid();

  return {
    tags: [
      { id: t1, label: "Bug", color: "#ffffff" },
      { id: t2, label: "Feature", color: "#a3a3a3" },
      { id: t3, label: "Urgent", color: "#525252" },
      { id: t4, label: "Design", color: "#737373" },
    ],
    cards: {
      [c1]: {
        id: c1,
        title: "Welcome! Click a card to edit it.",
        description: "Drag cards, or use the ◀ ▶ arrows to move them. Press the + to add new ones.",
        assignees: ["Sojs"],
        deadline: null,
        tagIds: [t2],
        createdAt: Date.now(),
      },
      [c2]: {
        id: c2,
        title: "Fix the login redirect",
        description: "Users get bounced to the wrong page after sign-in.",
        assignees: ["Trolleroof"],
        deadline: null,
        tagIds: [t1, t3],
        createdAt: Date.now(),
      },
      [c3]: {
        id: c3,
        title: "Polish the dashboard",
        description: "",
        assignees: ["OutcastVirus", "Alexgaoth"],
        deadline: null,
        tagIds: [t4],
        createdAt: Date.now(),
      },
    },
    columns: [
      { id: todo, title: "To Do", cardIds: [c1, c2] },
      { id: doing, title: "In Progress", cardIds: [c3] },
      { id: done, title: "Done", cardIds: [] },
    ],
  };
}
