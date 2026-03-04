import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  FileText,
  GraduationCap,
  Loader2,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddTopic,
  useRemoveTopic,
  useSubjects,
  useTopics,
} from "../hooks/useQueries";
import { getSubjectColor, getSubjectEmoji } from "../utils/subjectColors";

export default function SubjectPage() {
  const { id } = useParams({ from: "/subject/$id" });
  const navigate = useNavigate();

  const subjectId = BigInt(id);

  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const {
    data: topics,
    isLoading: topicsLoading,
    isError: topicsError,
  } = useTopics(subjectId);
  const addTopic = useAddTopic();
  const removeTopic = useRemoveTopic();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const subject = subjects?.find((s) => s.id === subjectId);
  const color = subject ? getSubjectColor(subject.id) : null;
  const emoji =
    subject && color ? getSubjectEmoji(subject.name, color.emoji) : "📚";

  async function handleAddTopic(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    try {
      await addTopic.mutateAsync({ subjectId, title: t, notes: notes.trim() });
      setTitle("");
      setNotes("");
      toast.success(`Topic "${t}" added`);
    } catch {
      toast.error("Failed to add topic. Please try again.");
    }
  }

  async function handleRemoveTopic(topicId: bigint, topicTitle: string) {
    try {
      await removeTopic.mutateAsync({ topicId, subjectId });
      toast.success(`"${topicTitle}" removed`);
    } catch {
      toast.error("Failed to remove topic.");
    }
  }

  const currentYear = new Date().getFullYear();
  const isLoading = subjectsLoading || topicsLoading;

  return (
    <div className="min-h-screen flex flex-col" data-ocid="subject_detail.page">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/90">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-background" />
          </div>
          <span className="font-display text-base font-semibold text-foreground">
            GCSE Revision
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Back + title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-4"
        >
          <a
            data-ocid="nav.back_link"
            onClick={(e) => {
              e.preventDefault();
              navigate({ to: "/" });
            }}
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            All Subjects
          </a>

          {subjectsLoading ? (
            <Skeleton className="h-12 w-56 rounded-xl" />
          ) : subject && color ? (
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-card flex-shrink-0"
                style={{ backgroundColor: color.bg }}
              >
                {emoji}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {subject.name}
              </h1>
            </div>
          ) : (
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Subject
            </h1>
          )}
        </motion.div>

        <Separator />

        {/* Add topic form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4"
        >
          <h2 className="font-display text-base font-semibold text-foreground">
            Add a new topic or note
          </h2>
          <form onSubmit={handleAddTopic} className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="topic-title"
                className="font-body text-sm text-muted-foreground"
              >
                Topic title <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="topic.input"
                id="topic-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Photosynthesis, World War 2, Quadratic equations"
                className="font-body h-10 text-sm rounded-xl"
                disabled={addTopic.isPending}
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="topic-notes"
                className="font-body text-sm text-muted-foreground"
              >
                Notes
              </Label>
              <Textarea
                data-ocid="topic.notes_textarea"
                id="topic-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes, key points, or revision tips here…"
                className="font-body text-sm rounded-xl resize-none min-h-[90px]"
                disabled={addTopic.isPending}
                aria-label="Topic notes"
              />
            </div>

            <Button
              data-ocid="topic.add_button"
              type="submit"
              disabled={!title.trim() || addTopic.isPending}
              className="h-10 px-5 rounded-xl font-display font-semibold gap-2"
            >
              {addTopic.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              Add Topic
            </Button>
          </form>
        </motion.div>

        {/* Topics list */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Revision Topics
            {topics && topics.length > 0 && (
              <span className="ml-2 text-sm font-body font-normal text-muted-foreground">
                ({topics.length})
              </span>
            )}
          </h2>

          {isLoading ? (
            <div className="space-y-3" data-ocid="topic.loading_state">
              {["tsk1", "tsk2", "tsk3"].map((k) => (
                <Skeleton key={k} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : topicsError ? (
            <div
              data-ocid="topic.error_state"
              className="py-10 text-center text-destructive font-body"
            >
              <p className="font-semibold">Couldn't load topics</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please refresh and try again.
              </p>
            </div>
          ) : topics && topics.length > 0 ? (
            <motion.div
              data-ocid="topic.list"
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05 } },
              }}
            >
              <AnimatePresence>
                {topics.map((topic, idx) => {
                  const ocidIdx = idx + 1;
                  return (
                    <motion.div
                      key={topic.id.toString()}
                      data-ocid={`topic.item.${ocidIdx}`}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.3, ease: "easeOut" },
                        },
                      }}
                      exit={{
                        opacity: 0,
                        x: 10,
                        transition: { duration: 0.2 },
                      }}
                      className="group bg-card border border-border rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow relative"
                    >
                      {/* Coloured left accent bar */}
                      {color && (
                        <div
                          className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
                          style={{ backgroundColor: color.bg }}
                          aria-hidden="true"
                        />
                      )}

                      <div className="pl-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display font-bold text-foreground text-base leading-snug">
                            {topic.title}
                          </h3>
                          <button
                            type="button"
                            data-ocid={`topic.delete_button.${ocidIdx}`}
                            onClick={() =>
                              handleRemoveTopic(topic.id, topic.title)
                            }
                            disabled={removeTopic.isPending}
                            aria-label={`Remove topic ${topic.title}`}
                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {removeTopic.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {topic.notes && (
                          <p className="text-sm font-body text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-wrap">
                            {topic.notes}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              data-ocid="topic.empty_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center py-16 gap-3 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shadow-xs">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold text-lg text-foreground">
                  No topics yet
                </p>
                <p className="text-sm font-body text-muted-foreground mt-0.5 max-w-xs">
                  Use the form above to add your first revision topic or note.
                </p>
              </div>
            </motion.div>
          )}
        </div>
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
