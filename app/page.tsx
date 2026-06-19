"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Board,
  Card,
  Person,
  PEOPLE,
  PERSON_COLORS,
  Tag,
  contrastText,
} from "./types";
import {
  fetchBoard,
  persistBoard,
  uid,
  defaultBoard,
  getBackend,
} from "./storage";
import CardEditor from "./CardEditor";

type DragInfo = { cardId: string; fromColumn: string } | null;

export default function Home() {
  const [board, setBoard] = useState<Board | null>(null);
  const [editing, setEditing] = useState<{ card: Card; columnId: string } | null>(
    null
  );
  const [drag, setDrag] = useState<DragInfo>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [filterPerson, setFilterPerson] = useState<Person | "All">("All");
  const [search, setSearch] = useState("");
  const [synced, setSynced] = useState<"cloud" | "local">("local");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    fetchBoard().then((b) => {
      setBoard(b);
      setSynced(getBackend() === "kv" ? "cloud" : "local");
      loaded.current = true;
    });
  }, []);

  // Debounced persistence so dragging / typing doesn't spam the backend.
  useEffect(() => {
    if (!board || !loaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persistBoard(board);
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [board]);

  const update = useCallback((fn: (b: Board) => Board) => {
    setBoard((prev) => (prev ? fn(structuredClone(prev)) : prev));
  }, []);

  const overdueCount = useMemo(() => {
    if (!board) return 0;
    return Object.values(board.cards).filter((c) => isOverdue(c.deadline))
      .length;
  }, [board]);

  if (!board) {
    return <div className="loading">Loading board…</div>;
  }

  const tagById = (id: string) => board.tags.find((t) => t.id === id);

  function addCard(columnId: string) {
    const id = uid();
    const card: Card = {
      id,
      title: "New task",
      description: "",
      assignees: [],
      deadline: null,
      tagIds: [],
      createdAt: Date.now(),
    };
    update((b) => {
      b.cards[id] = card;
      const col = b.columns.find((c) => c.id === columnId)!;
      col.cardIds.unshift(id);
      return b;
    });
    setEditing({ card, columnId });
  }

  function saveCard(updated: Card) {
    update((b) => {
      b.cards[updated.id] = updated;
      return b;
    });
    setEditing(null);
  }

  function deleteCard(cardId: string) {
    update((b) => {
      delete b.cards[cardId];
      b.columns.forEach((c) => {
        c.cardIds = c.cardIds.filter((id) => id !== cardId);
      });
      return b;
    });
    setEditing(null);
  }

  function moveCard(cardId: string, fromCol: string, dir: -1 | 1) {
    update((b) => {
      const idx = b.columns.findIndex((c) => c.id === fromCol);
      const target = b.columns[idx + dir];
      if (!target) return b;
      b.columns[idx].cardIds = b.columns[idx].cardIds.filter(
        (id) => id !== cardId
      );
      target.cardIds.unshift(cardId);
      return b;
    });
  }

  function sortColumnByDeadline(columnId: string) {
    update((b) => {
      const col = b.columns.find((c) => c.id === columnId);
      if (!col) return b;
      col.cardIds.sort((a, c) => {
        const da = b.cards[a]?.deadline;
        const dc = b.cards[c]?.deadline;
        if (!da && !dc) return 0;
        if (!da) return 1;
        if (!dc) return -1;
        return da.localeCompare(dc);
      });
      return b;
    });
  }

  function addColumn() {
    const title = prompt("Column name?", "New Column");
    if (!title) return;
    update((b) => {
      b.columns.push({ id: uid(), title, cardIds: [] });
      return b;
    });
  }

  function renameColumn(columnId: string, current: string) {
    const title = prompt("Rename column", current);
    if (!title) return;
    update((b) => {
      const col = b.columns.find((c) => c.id === columnId);
      if (col) col.title = title;
      return b;
    });
  }

  function deleteColumn(columnId: string) {
    update((b) => {
      const col = b.columns.find((c) => c.id === columnId);
      if (col) col.cardIds.forEach((id) => delete b.cards[id]);
      b.columns = b.columns.filter((c) => c.id !== columnId);
      return b;
    });
  }

  function onDrop(targetColumn: string) {
    if (!drag) return;
    update((b) => {
      const from = b.columns.find((c) => c.id === drag.fromColumn)!;
      from.cardIds = from.cardIds.filter((id) => id !== drag.cardId);
      const to = b.columns.find((c) => c.id === targetColumn)!;
      to.cardIds.unshift(drag.cardId);
      return b;
    });
    setDrag(null);
    setDragOverCol(null);
  }

  function setTags(tags: Tag[]) {
    update((b) => {
      b.tags = tags;
      const valid = new Set(tags.map((t) => t.id));
      Object.values(b.cards).forEach((card) => {
        card.tagIds = card.tagIds.filter((id) => valid.has(id));
      });
      return b;
    });
  }

  function resetBoard() {
    if (confirm("Reset the board to its default state? This clears all tasks.")) {
      const b = defaultBoard();
      setBoard(b);
      persistBoard(b);
    }
  }

  const q = search.trim().toLowerCase();

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <span className="logo">◼</span>
          <h1>TASKBOARD</h1>
          <span className={synced === "cloud" ? "sync cloud" : "sync local"}>
            {synced === "cloud" ? "● synced" : "○ local"}
          </span>
          {overdueCount > 0 && (
            <span className="overdue-badge">{overdueCount} overdue</span>
          )}
        </div>
        <div className="toolbar">
          <input
            className="search"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter">
            <button
              className={filterPerson === "All" ? "chip active" : "chip"}
              onClick={() => setFilterPerson("All")}
            >
              All
            </button>
            {PEOPLE.map((p) => (
              <button
                key={p}
                className={filterPerson === p ? "chip active" : "chip"}
                onClick={() =>
                  setFilterPerson((cur) => (cur === p ? "All" : p))
                }
              >
                {p}
              </button>
            ))}
          </div>
          <button className="btn ghost" onClick={addColumn}>
            + Column
          </button>
          <button className="btn ghost" onClick={resetBoard}>
            Reset
          </button>
        </div>
      </header>

      <div className="board">
        {board.columns.map((col, colIndex) => {
          const visibleCards = col.cardIds
            .map((id) => board.cards[id])
            .filter(Boolean)
            .filter(
              (c) =>
                filterPerson === "All" || c.assignees.includes(filterPerson)
            )
            .filter(
              (c) =>
                !q ||
                c.title.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q)
            );
          return (
            <section
              key={col.id}
              className={dragOverCol === col.id ? "column drag-over" : "column"}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col.id);
              }}
              onDragLeave={() =>
                setDragOverCol((c) => (c === col.id ? null : c))
              }
              onDrop={() => onDrop(col.id)}
            >
              <div className="column-head">
                <h2 onDoubleClick={() => renameColumn(col.id, col.title)}>
                  {col.title}
                  <span className="count">{visibleCards.length}</span>
                </h2>
                <div className="column-actions">
                  <button
                    title="Sort by deadline"
                    onClick={() => sortColumnByDeadline(col.id)}
                  >
                    ⇅
                  </button>
                  <button title="Add card" onClick={() => addCard(col.id)}>
                    +
                  </button>
                  <button
                    title="Delete column"
                    onClick={() => deleteColumn(col.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="cards">
                {visibleCards.length === 0 && (
                  <div className="empty-hint">Drop tasks here</div>
                )}
                {visibleCards.map((card) => (
                  <article
                    key={card.id}
                    className="card"
                    draggable
                    onDragStart={() =>
                      setDrag({ cardId: card.id, fromColumn: col.id })
                    }
                    onDragEnd={() => {
                      setDrag(null);
                      setDragOverCol(null);
                    }}
                    onClick={() => setEditing({ card, columnId: col.id })}
                  >
                    {card.tagIds.length > 0 && (
                      <div className="card-tags">
                        {card.tagIds.map((tid) => {
                          const tag = tagById(tid);
                          if (!tag) return null;
                          return (
                            <span
                              key={tid}
                              className="tag"
                              style={{
                                background: tag.color,
                                color: contrastText(tag.color),
                              }}
                            >
                              {tag.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="card-title">{card.title}</div>
                    {card.description && (
                      <p className="card-desc">{card.description}</p>
                    )}
                    <div className="card-foot">
                      <div className="avatars">
                        {card.assignees.map((p) => (
                          <span
                            key={p}
                            className="avatar"
                            title={p}
                            style={{
                              background: PERSON_COLORS[p],
                              color: contrastText(PERSON_COLORS[p]),
                            }}
                          >
                            {p[0]}
                          </span>
                        ))}
                      </div>
                      {card.deadline && (
                        <span
                          className={
                            isOverdue(card.deadline)
                              ? "deadline overdue"
                              : "deadline"
                          }
                        >
                          {formatDate(card.deadline)}
                        </span>
                      )}
                    </div>
                    <div className="card-move">
                      <button
                        title="Move left"
                        disabled={colIndex === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCard(card.id, col.id, -1);
                        }}
                      >
                        ◀
                      </button>
                      <button
                        title="Move right"
                        disabled={colIndex === board.columns.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCard(card.id, col.id, 1);
                        }}
                      >
                        ▶
                      </button>
                    </div>
                  </article>
                ))}
                <button className="add-card" onClick={() => addCard(col.id)}>
                  + Add a card
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {editing && (
        <CardEditor
          card={editing.card}
          tags={board.tags}
          onSave={saveCard}
          onDelete={deleteCard}
          onClose={() => setEditing(null)}
          onTagsChange={setTags}
        />
      )}
    </main>
  );
}

function isOverdue(deadline: string | null) {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(deadline + "T00:00:00") < today;
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
