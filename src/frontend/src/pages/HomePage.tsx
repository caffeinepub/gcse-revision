import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddSubject,
  useRemoveSubject,
  useSubjects,
} from "../hooks/useQueries";
import { getSubjectColor, getSubjectEmoji } from "../utils/subjectColors";

const SAMPLE_SUGGESTIONS = [
  "Maths",
  "English",
  "Biology",
  "Chemistry",
  "Physics",
  "History",
];

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

export default function HomePage() {
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState("");

  const { data: subjects, isLoading, isError } = useSubjects();
  const addSubject = useAddSubject();
  const removeSubject = useRemoveSubject();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = subjectName.trim();
    if (!name) return;
    try {
      await addSubject.mutateAsync(name);
      setSubjectName("");
      toast.success(`"${name}" added to your subjects`);
    } catch {
      toast.error("Failed to add subject. Please try again.");
    }
  }

  async function handleRemove(id: bigint, name: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await removeSubject.mutateAsync(id);
      toast.success(`"${name}" removed`);
    } catch {
      toast.error("Failed to remove subject.");
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col" data-ocid="home.page">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight tracking-tight text-foreground">
              GCSE Revision
            </h1>
            <p className="text-xs text-muted-foreground font-body">
              Your personal study companion
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-1"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            My Subjects
          </h2>
          <p className="text-muted-foreground font-body text-base">
            Pick a subject to start revising, or add a new one below.
          </p>
        </motion.div>

        {/* Add subject form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
        >
          <form onSubmit={handleAdd} className="flex gap-2 max-w-md">
            <Input
              data-ocid="subject.input"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Add a subject e.g. Maths"
              className="font-body h-11 text-base rounded-xl border-border focus-visible:ring-ring"
              disabled={addSubject.isPending}
              aria-label="Subject name"
              list="subject-suggestions"
            />
            <datalist id="subject-suggestions">
              {SAMPLE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <Button
              data-ocid="subject.add_button"
              type="submit"
              disabled={!subjectName.trim() || addSubject.isPending}
              className="h-11 px-5 rounded-xl font-display font-semibold tracking-wide gap-2"
            >
              {addSubject.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              Add
            </Button>
          </form>
        </motion.div>

        {/* Subject grid */}
        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="subject.list"
          >
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div
            data-ocid="subject.error_state"
            className="text-center py-16 text-destructive font-body"
          >
            <p className="text-lg font-semibold">Couldn't load subjects</p>
            <p className="text-sm mt-1 text-muted-foreground">
              Please refresh and try again.
            </p>
          </div>
        ) : subjects && subjects.length > 0 ? (
          <motion.div
            data-ocid="subject.list"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            <AnimatePresence>
              {subjects.map((subject, idx) => {
                const color = getSubjectColor(subject.id);
                const emoji = getSubjectEmoji(subject.name, color.emoji);
                const ocidIdx = idx + 1;
                return (
                  <motion.div
                    key={subject.id.toString()}
                    data-ocid={`subject.item.${ocidIdx}`}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.35, ease: "easeOut" },
                      },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.92,
                      transition: { duration: 0.2 },
                    }}
                    whileHover={{
                      y: -4,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      },
                    }}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover transition-shadow"
                    style={{ backgroundColor: color.bg }}
                    onClick={() =>
                      navigate({
                        to: "/subject/$id",
                        params: { id: subject.id.toString() },
                      })
                    }
                    tabIndex={0}
                    aria-label={`Open ${subject.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigate({
                          to: "/subject/$id",
                          params: { id: subject.id.toString() },
                        });
                      }
                    }}
                  >
                    {/* Card body */}
                    <div className="p-4 pt-5 pb-3 min-h-[9rem] flex flex-col justify-between">
                      {/* Emoji */}
                      <span
                        className="text-4xl leading-none select-none"
                        aria-hidden="true"
                      >
                        {emoji}
                      </span>
                      {/* Subject name */}
                      <p
                        className="font-display font-bold text-white text-lg leading-tight mt-3 line-clamp-2"
                        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
                      >
                        {subject.name}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      data-ocid={`subject.delete_button.${ocidIdx}`}
                      onClick={(e) => handleRemove(subject.id, subject.name, e)}
                      disabled={removeSubject.isPending}
                      aria-label={`Remove ${subject.name}`}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {removeSubject.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            data-ocid="subject.empty_state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col items-center justify-center py-20 text-center gap-4"
          >
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center shadow-card">
              <BookOpen className="w-9 h-9 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-xl font-semibold text-foreground">
                No subjects yet
              </p>
              <p className="text-muted-foreground font-body text-sm max-w-xs">
                Add your first subject above — like Maths, English, or Biology —
                to get started.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {SAMPLE_SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSubjectName(s)}
                  className="px-3 py-1.5 rounded-full text-sm font-body bg-secondary hover:bg-border transition-colors text-foreground border border-border"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 text-center text-sm text-muted-foreground font-body">
        © {currentYear}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors underline underline-offset-2"
        >
          Built with love using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
