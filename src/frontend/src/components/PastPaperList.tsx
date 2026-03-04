import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  ChevronDown,
  Download,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { PastPaperId, SubjectId } from "../backend.d";
import {
  useAddPastPaper,
  usePastPapers,
  useRemovePastPaper,
  useUpdatePastPaperNotes,
} from "../hooks/useQueries";

interface PastPaperListProps {
  subjectId: SubjectId;
  accentColor?: string;
}

interface PastPaperRowProps {
  id: PastPaperId;
  title: string;
  year?: bigint;
  notes: string;
  subjectId: SubjectId;
  idx: number;
  accentColor?: string;
  onRemove: (id: PastPaperId, title: string) => void;
  isRemoving: boolean;
}

function PastPaperRow({
  id,
  title,
  year,
  notes,
  subjectId,
  idx,
  accentColor,
  onRemove,
  isRemoving,
}: PastPaperRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);
  const [isDirty, setIsDirty] = useState(false);
  const updateNotes = useUpdatePastPaperNotes();

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
        pastPaperId: id,
        notes: localNotes,
        subjectId,
      });
      setIsDirty(false);
    } catch {
      toast.error(`Failed to save notes for "${title}".`);
    }
  }, [isDirty, id, localNotes, subjectId, title, updateNotes]);

  const handleBlur = () => {
    if (isDirty) {
      handleSave();
    }
  };

  const hasNotes = notes.trim().length > 0;

  function handleDownload() {
    const lines: string[] = [];
    lines.push(`Past Paper: ${title}`);
    if (year !== undefined) lines.push(`Year: ${Number(year)}`);
    if (notes.trim()) {
      lines.push("");
      lines.push("Notes:");
      lines.push(notes.trim());
    }
    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    a.href = url;
    a.download = `${safeName}${year !== undefined ? `-${Number(year)}` : ""}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <li
      data-ocid={`pastpaper.item.${idx + 1}`}
      className="group/pp rounded-xl border border-border/60 bg-card hover:border-border transition-all"
    >
      {/* Row header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Expand toggle */}
        <button
          type="button"
          data-ocid={`pastpaper.expand_toggle.${idx + 1}`}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Collapse" : "Expand"} past paper "${title}"`}
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-muted-foreground/60 hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
        >
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}
          />
        </button>

        {/* Accent dot */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            backgroundColor: accentColor ?? "var(--color-primary)",
            opacity: 0.75,
          }}
          aria-hidden="true"
        />

        {/* Title + year */}
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <span className="text-sm font-body font-medium text-foreground/85 truncate">
            {title}
          </span>
          {year !== undefined && (
            <span className="text-xs font-body text-muted-foreground flex-shrink-0">
              {Number(year)}
            </span>
          )}
        </div>

        {/* Notes indicator */}
        {hasNotes && !expanded && (
          <span
            title="Has notes"
            aria-label="Has notes"
            className="flex-shrink-0 text-muted-foreground/50"
          >
            <FileText className="w-3 h-3" />
          </span>
        )}

        {/* Saving spinner */}
        {updateNotes.isPending && (
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/60 flex-shrink-0" />
        )}

        {/* Download button */}
        <button
          type="button"
          data-ocid={`pastpaper.download_button.${idx + 1}`}
          onClick={handleDownload}
          aria-label={`Download past paper "${title}"`}
          className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover/pp:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Delete button */}
        <button
          type="button"
          data-ocid={`pastpaper.delete_button.${idx + 1}`}
          onClick={() => onRemove(id, title)}
          disabled={isRemoving}
          aria-label={`Remove past paper "${title}"`}
          className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover/pp:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex-shrink-0"
        >
          {isRemoving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable notes panel */}
      {expanded && (
        <div className="px-3 pb-3 pt-0">
          <div className="pl-7">
            <textarea
              data-ocid={`pastpaper.notes_textarea.${idx + 1}`}
              value={localNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="Add notes for this past paper…"
              aria-label={`Notes for past paper "${title}"`}
              rows={3}
              className="w-full text-xs font-body resize-none rounded-lg border border-border bg-muted/40 px-2.5 py-2 text-foreground/80 placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors leading-relaxed"
            />
            {isDirty && (
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  data-ocid={`pastpaper.save_button.${idx + 1}`}
                  onClick={handleSave}
                  disabled={updateNotes.isPending}
                  className="h-6 px-3 text-[10px] font-body font-medium rounded-md flex items-center gap-1 border border-border bg-background text-foreground/70 hover:text-foreground hover:bg-secondary hover:border-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all"
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
        </div>
      )}
    </li>
  );
}

export default function PastPaperList({
  subjectId,
  accentColor,
}: PastPaperListProps) {
  const { data: pastPapers, isLoading } = usePastPapers(subjectId);
  const addPastPaper = useAddPastPaper();
  const removePastPaper = useRemovePastPaper();

  const [formTitle, setFormTitle] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formNotes, setFormNotes] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const t = formTitle.trim();
    if (!t) return;
    const yearNum = formYear.trim() ? Number(formYear.trim()) : null;
    const yearBig =
      yearNum !== null && !Number.isNaN(yearNum) ? BigInt(yearNum) : null;
    try {
      await addPastPaper.mutateAsync({
        subjectId,
        title: t,
        year: yearBig,
        notes: formNotes.trim(),
      });
      setFormTitle("");
      setFormYear("");
      setFormNotes("");
      toast.success(`Past paper "${t}" added`);
    } catch {
      toast.error("Failed to add past paper. Please try again.");
    }
  }

  async function handleRemove(pastPaperId: PastPaperId, paperTitle: string) {
    try {
      await removePastPaper.mutateAsync({ pastPaperId, subjectId });
      toast.success(`"${paperTitle}" removed`);
    } catch {
      toast.error("Failed to remove past paper.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Section divider */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
        <div className="flex items-center gap-1.5 text-muted-foreground/60">
          <BookOpen className="w-3 h-3" />
          <span className="text-[10px] font-body font-medium uppercase tracking-widest">
            Past Papers
          </span>
        </div>
        <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="space-y-2.5">
        {/* Title + Year row */}
        <div className="flex gap-2">
          <input
            data-ocid="pastpaper.input"
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="e.g. June 2022 Paper 1"
            required
            aria-label="Past paper title"
            disabled={addPastPaper.isPending}
            className="flex-1 min-w-0 h-8 px-3 text-xs font-body rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 transition-colors"
          />
          <input
            data-ocid="pastpaper.year_input"
            type="number"
            value={formYear}
            onChange={(e) => setFormYear(e.target.value)}
            placeholder="Year"
            aria-label="Past paper year (optional)"
            min={1900}
            max={2100}
            disabled={addPastPaper.isPending}
            className="w-20 h-8 px-2.5 text-xs font-body rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            data-ocid="pastpaper.add_button"
            disabled={!formTitle.trim() || addPastPaper.isPending}
            aria-label="Add past paper"
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all text-muted-foreground border border-border bg-background hover:text-foreground hover:border-foreground/30 hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {addPastPaper.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Optional notes on add */}
        <textarea
          data-ocid="pastpaper.notes_textarea"
          value={formNotes}
          onChange={(e) => setFormNotes(e.target.value)}
          placeholder="Notes (optional)…"
          aria-label="Past paper notes"
          rows={2}
          disabled={addPastPaper.isPending}
          className="w-full text-xs font-body resize-none rounded-lg border border-border bg-background px-2.5 py-2 text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 transition-colors leading-relaxed"
        />
      </form>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {["pp1", "pp2"].map((k) => (
            <Skeleton key={k} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      ) : pastPapers && pastPapers.length > 0 ? (
        <ul className="space-y-1.5">
          {pastPapers.map((paper, idx) => (
            <PastPaperRow
              key={paper.id.toString()}
              id={paper.id}
              title={paper.title}
              year={paper.year}
              notes={paper.notes}
              subjectId={subjectId}
              idx={idx}
              accentColor={accentColor}
              onRemove={handleRemove}
              isRemoving={removePastPaper.isPending}
            />
          ))}
        </ul>
      ) : (
        <p
          data-ocid="pastpaper.empty_state"
          className="text-[11px] font-body text-muted-foreground/50 italic pl-1"
        >
          No past papers yet
        </p>
      )}
    </div>
  );
}
