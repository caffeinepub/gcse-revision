import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, FileText, Loader2, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { SubTopicId, TopicId } from "../backend.d";
import {
  useAddSubTopic,
  useRemoveSubTopic,
  useSubTopics,
  useUpdateSubTopicNotes,
} from "../hooks/useQueries";

interface SubTopicListProps {
  topicId: TopicId;
  accentColor?: string;
}

interface SubTopicRowProps {
  id: SubTopicId;
  heading: string;
  notes: string;
  topicId: TopicId;
  idx: number;
  accentColor?: string;
  onRemove: (id: SubTopicId, heading: string) => void;
  isRemoving: boolean;
}

function SubTopicRow({
  id,
  heading,
  notes,
  topicId,
  idx,
  accentColor,
  onRemove,
  isRemoving,
}: SubTopicRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);
  const [isDirty, setIsDirty] = useState(false);
  const updateNotes = useUpdateSubTopicNotes();

  // Sync localNotes if the server value changes (e.g. after invalidation)
  useEffect(() => {
    setLocalNotes(notes);
    setIsDirty(false);
  }, [notes]);

  const handleNotesChange = (val: string) => {
    setLocalNotes(val);
    setIsDirty(val !== notes);
  };

  const handleSave = useCallback(async () => {
    if (!isDirty) return;
    try {
      await updateNotes.mutateAsync({
        subTopicId: id,
        notes: localNotes,
        topicId,
      });
      setIsDirty(false);
    } catch {
      toast.error(`Failed to save notes for "${heading}".`);
    }
  }, [isDirty, id, localNotes, topicId, heading, updateNotes]);

  const handleBlur = () => {
    if (isDirty) {
      handleSave();
    }
  };

  const hasNotes = notes.trim().length > 0;

  return (
    <li
      key={id.toString()}
      data-ocid={`subtopic.item.${idx + 1}`}
      className="group/st rounded-lg border border-transparent hover:border-border/50 transition-all"
    >
      {/* Row header */}
      <div className="flex items-center gap-2 py-0.5 px-0.5">
        {/* Expand toggle */}
        <button
          type="button"
          data-ocid={`subtopic.expand_toggle.${idx + 1}`}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Collapse" : "Expand"} sub-topic "${heading}"`}
          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-muted-foreground/60 hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
        >
          <ChevronDown
            className="w-3 h-3 transition-transform duration-200"
            style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}
          />
        </button>

        {/* Bullet dot */}
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: accentColor ?? "var(--color-primary)",
            opacity: 0.7,
          }}
          aria-hidden="true"
        />

        {/* Heading */}
        <span className="text-xs font-body text-foreground/80 flex-1 leading-snug">
          {heading}
        </span>

        {/* Notes indicator */}
        {hasNotes && !expanded && (
          <span
            title="Has notes"
            aria-label="Has notes"
            className="flex-shrink-0 text-muted-foreground/50"
          >
            <FileText className="w-2.5 h-2.5" />
          </span>
        )}

        {/* Saving spinner */}
        {updateNotes.isPending && (
          <Loader2 className="w-2.5 h-2.5 animate-spin text-muted-foreground/60 flex-shrink-0" />
        )}

        {/* Remove button */}
        <button
          type="button"
          data-ocid={`subtopic.delete_button.${idx + 1}`}
          onClick={() => onRemove(id, heading)}
          disabled={isRemoving}
          aria-label={`Remove sub-topic "${heading}"`}
          className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover/st:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex-shrink-0"
        >
          {isRemoving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <X className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Expandable notes panel */}
      {expanded && (
        <div className="pl-6 pr-1 pb-2 pt-1">
          <textarea
            data-ocid={`subtopic.notes_textarea.${idx + 1}`}
            value={localNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Add notes for this sub-topic…"
            aria-label={`Notes for sub-topic "${heading}"`}
            rows={3}
            className="w-full text-xs font-body resize-none rounded-md border border-border bg-muted/40 px-2.5 py-2 text-foreground/80 placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors leading-relaxed"
          />
          {isDirty && (
            <div className="flex justify-end mt-1">
              <button
                type="button"
                data-ocid={`subtopic.save_button.${idx + 1}`}
                onClick={handleSave}
                disabled={updateNotes.isPending}
                className="h-6 px-2.5 text-[10px] font-body font-medium rounded-md flex items-center gap-1 border border-border bg-background text-foreground/70 hover:text-foreground hover:bg-secondary hover:border-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all"
              >
                {updateNotes.isPending ? (
                  <>
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function SubTopicList({
  topicId,
  accentColor,
}: SubTopicListProps) {
  const { data: subTopics, isLoading } = useSubTopics(topicId);
  const addSubTopic = useAddSubTopic();
  const removeSubTopic = useRemoveSubTopic();

  const [heading, setHeading] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const h = heading.trim();
    if (!h) return;
    try {
      await addSubTopic.mutateAsync({ topicId, heading: h });
      setHeading("");
    } catch {
      toast.error("Failed to add sub-topic.");
    }
  }

  async function handleRemove(subTopicId: SubTopicId, subTopicHeading: string) {
    try {
      await removeSubTopic.mutateAsync({ subTopicId, topicId });
    } catch {
      toast.error(`Failed to remove "${subTopicHeading}".`);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Subtle visual separator */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
        <span className="text-[10px] font-body font-medium text-muted-foreground/60 uppercase tracking-widest">
          Sub-topics
        </span>
        <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
      </div>

      {/* Sub-topic rows */}
      {isLoading ? (
        <div className="space-y-1.5">
          {["st1", "st2"].map((k) => (
            <Skeleton key={k} className="h-5 w-3/4 rounded-md" />
          ))}
        </div>
      ) : subTopics && subTopics.length > 0 ? (
        <ul className="space-y-0.5">
          {subTopics.map((st, idx) => (
            <SubTopicRow
              key={st.id.toString()}
              id={st.id}
              heading={st.heading}
              notes={st.notes}
              topicId={topicId}
              idx={idx}
              accentColor={accentColor}
              onRemove={handleRemove}
              isRemoving={removeSubTopic.isPending}
            />
          ))}
        </ul>
      ) : (
        <p
          data-ocid="subtopic.empty_state"
          className="text-[11px] font-body text-muted-foreground/50 italic pl-3.5"
        >
          No sub-topics yet
        </p>
      )}

      {/* Add sub-topic inline form */}
      <form onSubmit={handleAdd} className="flex items-center gap-1.5 pt-0.5">
        <input
          data-ocid={`subtopic.input.${topicId}`}
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Add sub-topic…"
          disabled={addSubTopic.isPending}
          aria-label="New sub-topic heading"
          className="flex-1 min-w-0 h-7 px-2.5 text-xs font-body rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          data-ocid={`subtopic.add_button.${topicId}`}
          disabled={!heading.trim() || addSubTopic.isPending}
          aria-label="Add sub-topic"
          className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all text-muted-foreground border border-border bg-background hover:text-foreground hover:border-foreground/30 hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {addSubTopic.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
        </button>
      </form>
    </div>
  );
}
