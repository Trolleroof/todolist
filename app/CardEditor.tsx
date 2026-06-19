"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Person,
  PEOPLE,
  PERSON_COLORS,
  Tag,
  TAG_PALETTE,
  contrastText,
} from "./types";
import { uid } from "./storage";

export default function CardEditor({
  card,
  tags,
  onSave,
  onDelete,
  onClose,
  onTagsChange,
}: {
  card: Card;
  tags: Tag[];
  onSave: (c: Card) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onTagsChange: (tags: Tag[]) => void;
}) {
  const [draft, setDraft] = useState<Card>({ ...card });
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_PALETTE[2]);

  // Esc closes, Cmd/Ctrl+Enter saves.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSave(draft);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft, onClose, onSave]);

  function toggleAssignee(p: Person) {
    setDraft((d) => ({
      ...d,
      assignees: d.assignees.includes(p)
        ? d.assignees.filter((x) => x !== p)
        : [...d.assignees, p],
    }));
  }

  function toggleTag(id: string) {
    setDraft((d) => ({
      ...d,
      tagIds: d.tagIds.includes(id)
        ? d.tagIds.filter((x) => x !== id)
        : [...d.tagIds, id],
    }));
  }

  function createTag() {
    const label = newTagLabel.trim();
    if (!label) return;
    const tag: Tag = { id: uid(), label, color: newTagColor };
    onTagsChange([...tags, tag]);
    setDraft((d) => ({ ...d, tagIds: [...d.tagIds, tag.id] }));
    setNewTagLabel("");
  }

  function removeTag(id: string) {
    if (!confirm("Delete this tag everywhere?")) return;
    onTagsChange(tags.filter((t) => t.id !== id));
    setDraft((d) => ({ ...d, tagIds: d.tagIds.filter((x) => x !== id) }));
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <input
            className="title-input"
            value={draft.title}
            placeholder="Task title"
            autoFocus
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <button className="icon-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <label className="field-label">Description</label>
        <textarea
          className="desc-input"
          value={draft.description}
          placeholder="Add more detail…"
          rows={4}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />

        <label className="field-label">Assignees</label>
        <div className="people">
          {PEOPLE.map((p) => {
            const on = draft.assignees.includes(p);
            return (
              <button
                key={p}
                className={on ? "person on" : "person"}
                style={
                  on
                    ? {
                        background: PERSON_COLORS[p],
                        borderColor: PERSON_COLORS[p],
                        color: contrastText(PERSON_COLORS[p]),
                      }
                    : { borderColor: "#555", color: "#e8e8e8" }
                }
                onClick={() => toggleAssignee(p)}
              >
                <span
                  className="avatar sm"
                  style={{
                    background: PERSON_COLORS[p],
                    color: contrastText(PERSON_COLORS[p]),
                  }}
                >
                  {p[0]}
                </span>
                {p}
              </button>
            );
          })}
        </div>

        <label className="field-label">Deadline</label>
        <div className="deadline-row">
          <input
            type="date"
            value={draft.deadline ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, deadline: e.target.value || null })
            }
          />
          {draft.deadline && (
            <button
              className="btn ghost sm"
              onClick={() => setDraft({ ...draft, deadline: null })}
            >
              Clear
            </button>
          )}
        </div>

        <label className="field-label">Tags</label>
        <div className="tag-list">
          {tags.map((t) => {
            const on = draft.tagIds.includes(t.id);
            return (
              <span key={t.id} className="tag-row">
                <button
                  className={on ? "tag-toggle on" : "tag-toggle"}
                  style={{
                    background: on ? t.color : "transparent",
                    borderColor: t.color,
                    color: on ? contrastText(t.color) : "#e8e8e8",
                  }}
                  onClick={() => toggleTag(t.id)}
                >
                  {t.label}
                </button>
                <button
                  className="tag-del"
                  title="Delete tag"
                  onClick={() => removeTag(t.id)}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>

        <div className="new-tag">
          <input
            placeholder="New tag name"
            value={newTagLabel}
            onChange={(e) => setNewTagLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTag()}
          />
          <div className="swatches">
            {TAG_PALETTE.map((c) => (
              <button
                key={c}
                className={newTagColor === c ? "swatch active" : "swatch"}
                style={{ background: c }}
                onClick={() => setNewTagColor(c)}
              />
            ))}
          </div>
          <button className="btn" onClick={createTag}>
            Add tag
          </button>
        </div>

        <div className="modal-foot">
          <button
            className="btn danger"
            onClick={() => {
              if (confirm("Delete this task?")) onDelete(draft.id);
            }}
          >
            Delete
          </button>
          <div className="spacer" />
          <span className="hint">⌘↵ save · esc close</span>
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => onSave(draft)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
