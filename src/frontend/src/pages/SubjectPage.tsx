import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { SubjectImageId } from "../backend.d";
import PastPaperList from "../components/PastPaperList";
import SubTopicList from "../components/SubTopicList";
import { useLearnedTopics } from "../hooks/useLearnedTopics";
import {
  useAddSubjectImage,
  useAddTopic,
  usePastPapers,
  useRemoveSubjectImage,
  useRemoveTopic,
  useSubjectImages,
  useSubjects,
  useTopics,
} from "../hooks/useQueries";
import { getSubjectColor, getSubjectEmoji } from "../utils/subjectColors";

export default function SubjectPage() {
  const { id } = useParams({ from: "/subject/$id" });
  const navigate = useNavigate();

  const subjectId = BigInt(id);

  const { learnedIds, toggleLearned, isLearned } = useLearnedTopics(subjectId);

  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const {
    data: topics,
    isLoading: topicsLoading,
    isError: topicsError,
  } = useTopics(subjectId);
  const addTopic = useAddTopic();
  const removeTopic = useRemoveTopic();

  const { data: subjectImages, isLoading: imagesLoading } =
    useSubjectImages(subjectId);
  const addSubjectImage = useAddSubjectImage();
  const removeSubjectImage = useRemoveSubjectImage();

  const { data: pastPapers } = usePastPapers(subjectId);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const topicsRef = useRef<HTMLDivElement>(null);

  // Collapsible topics state
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  function toggleExpanded(topicId: bigint) {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      const key = topicId.toString();
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function isExpanded(topicId: bigint) {
    return expandedTopics.has(topicId.toString());
  }

  // Image upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDownloadImage() {
    if (!topicsRef.current || !subject || !topics || topics.length === 0)
      return;
    setIsDownloading(true);
    try {
      const safeName = subject.name.toLowerCase().replace(/\s+/g, "-");
      const padding = 24;
      const lineHeight = 24;
      const titleSize = 22;
      const bodySize = 14;
      const itemGap = 12;

      // Build lines to render
      const lines: Array<{
        text: string;
        size: number;
        bold: boolean;
        color: string;
      }> = [
        {
          text: `${emoji}  ${subject.name} — Revision Topics`,
          size: titleSize,
          bold: true,
          color: "#1a1a2e",
        },
        { text: "", size: bodySize, bold: false, color: "#888" },
      ];
      for (const t of topics) {
        lines.push({
          text: `• ${t.title}`,
          size: bodySize + 1,
          bold: true,
          color: "#1a1a2e",
        });
        if (t.notes) {
          lines.push({
            text: `  ${t.notes}`,
            size: bodySize - 1,
            bold: false,
            color: "#555",
          });
        }
        lines.push({
          text: "",
          size: bodySize - 4,
          bold: false,
          color: "#888",
        });
      }

      const canvas = document.createElement("canvas");
      const width = 640;
      canvas.width = width;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // First pass: measure height
      let totalHeight = padding * 2;
      for (const line of lines) {
        ctx.font = `${line.bold ? "700" : "400"} ${line.size}px sans-serif`;
        const wrapped = wrapText(ctx, line.text, width - padding * 2);
        totalHeight +=
          wrapped.length * lineHeight + (wrapped.length > 0 ? itemGap : 0);
      }

      canvas.height = Math.max(totalHeight, 200);

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Second pass: draw
      let y = padding + lineHeight;
      for (const line of lines) {
        ctx.font = `${line.bold ? "700" : "400"} ${line.size}px sans-serif`;
        ctx.fillStyle = line.color;
        const wrapped = wrapText(ctx, line.text, width - padding * 2);
        if (wrapped.length === 0) {
          y += lineHeight / 2;
        } else {
          for (const wline of wrapped) {
            ctx.fillText(wline, padding, y);
            y += lineHeight;
          }
          y += itemGap / 2;
        }
      }

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${safeName}-topics.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Topics image downloaded!");
    } catch {
      toast.error("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] {
    if (!text.trim()) return [];
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

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

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const externalBlob = ExternalBlob.fromBytes(bytes).withUploadProgress(
        (percentage: number) => {
          setUploadProgress(percentage);
        },
      );

      await addSubjectImage.mutateAsync({ subjectId, blob: externalBlob });
      toast.success("Image uploaded!");
      setUploadProgress(null);
    } catch {
      toast.error("Failed to upload image. Please try again.");
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  async function handleRemoveImage(imageId: SubjectImageId) {
    try {
      await removeSubjectImage.mutateAsync({ imageId, subjectId });
      toast.success("Image removed.");
    } catch {
      toast.error("Failed to remove image.");
    }
  }

  const currentYear = new Date().getFullYear();
  const isLoading = subjectsLoading || topicsLoading;

  const hasImages = (subjectImages?.length ?? 0) > 0;

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
            <div className="flex items-center gap-3 flex-wrap">
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

        {/* Multi-image strip section */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {imagesLoading ? (
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map((k) => (
                <Skeleton
                  key={k}
                  className="w-24 h-24 rounded-xl flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            <div
              data-ocid="subject.image_dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={[
                "relative rounded-2xl transition-all duration-200 p-3",
                isDragOver
                  ? "border-2 border-dashed border-primary/60 bg-primary/5 scale-[1.005]"
                  : hasImages || isUploading
                    ? "border border-border bg-card/50 space-y-3"
                    : "border-2 border-dashed border-border",
              ].join(" ")}
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                id="subject-image-upload"
                className="sr-only"
                onChange={handleFileInputChange}
                disabled={isUploading}
              />

              {/* Drag overlay hint */}
              {isDragOver && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
                  <div className="bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 text-sm font-body font-medium shadow-lg">
                    Drop to add image
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 w-full">
                {/* Full-size images */}
                <AnimatePresence>
                  {(subjectImages ?? []).map((entry, idx) => {
                    const imgUrl = entry.blob.getDirectURL();
                    const ocidIdx = idx + 1;
                    return (
                      <motion.div
                        key={entry.id.toString()}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="relative group/thumb"
                      >
                        {/* Full-size image */}
                        <img
                          src={imgUrl}
                          alt={`${subject?.name ?? "Subject"} ${ocidIdx}`}
                          className="w-auto max-w-full h-auto rounded-xl border border-border shadow-xs"
                          style={{ display: "block" }}
                        />
                        {/* Remove X button */}
                        <button
                          type="button"
                          data-ocid={`subject.image_remove_button.${ocidIdx}`}
                          onClick={() => handleRemoveImage(entry.id)}
                          aria-label={`Remove image ${ocidIdx}`}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md opacity-0 group-hover/thumb:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring z-10"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Upload in progress */}
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 py-3"
                  >
                    <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                    {uploadProgress !== null && (
                      <Progress
                        value={uploadProgress}
                        className="h-1.5 flex-1 rounded-full"
                      />
                    )}
                    <span className="text-sm font-body text-muted-foreground flex-shrink-0">
                      Uploading…
                    </span>
                  </motion.div>
                )}

                {/* Add image button */}
                {!isUploading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <label
                      data-ocid="subject.image_add_button"
                      htmlFor="subject-image-upload"
                      className={[
                        "inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-ring text-sm font-body font-medium",
                        isDragOver
                          ? "border-primary/60 bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:bg-secondary/40 hover:text-foreground",
                      ].join(" ")}
                      aria-label="Add image"
                    >
                      <Plus className="w-4 h-4" />
                      Add image
                    </label>
                  </motion.div>
                )}

                {/* Empty state hint when no images */}
                {!hasImages && !isUploading && (
                  <p className="text-sm font-body text-muted-foreground">
                    Drag & drop or click{" "}
                    <span className="font-medium text-foreground">
                      + Add image
                    </span>{" "}
                    to upload images for this subject
                  </p>
                )}
              </div>
            </div>
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
        <div ref={topicsRef} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Revision Topics
                {topics && topics.length > 0 && (
                  <span className="ml-2 text-sm font-body font-normal text-muted-foreground">
                    ({topics.length})
                  </span>
                )}
              </h2>
              {topics && topics.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-body font-medium bg-success/15 text-success border border-success/25">
                  <CheckCircle2 className="w-3 h-3" />
                  {learnedIds.size} / {topics.length} learned
                </span>
              )}
            </div>
            <Button
              data-ocid="topic.download_button"
              data-exclude-from-image="true"
              type="button"
              variant="outline"
              size="sm"
              disabled={
                !topics ||
                topics.length === 0 ||
                isLoading ||
                topicsError ||
                isDownloading
              }
              onClick={handleDownloadImage}
              className="h-8 px-3 rounded-xl font-body text-xs gap-1.5 flex-shrink-0"
              aria-label="Download topics as image"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isDownloading ? "Downloading…" : "Download Image"}
            </Button>
          </div>
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
                      animate={{ opacity: isLearned(topic.id) ? 0.6 : 1 }}
                      transition={{ duration: 0.2 }}
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
                        {/* Clickable header row — collapses/expands the body */}
                        <button
                          type="button"
                          data-ocid={`topic.toggle.${ocidIdx}`}
                          onClick={() => toggleExpanded(topic.id)}
                          aria-expanded={isExpanded(topic.id)}
                          aria-label={
                            isExpanded(topic.id)
                              ? `Collapse topic ${topic.title}`
                              : `Expand topic ${topic.title}`
                          }
                          className="w-full flex items-center gap-2 text-left cursor-pointer rounded-lg px-0 py-1 -mx-0 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                        >
                          <span
                            className="flex-shrink-0 text-muted-foreground transition-transform duration-200"
                            aria-hidden="true"
                          >
                            {isExpanded(topic.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </span>
                          <h3
                            className={[
                              "font-display font-bold text-foreground text-base leading-snug transition-all duration-200 flex-1 min-w-0",
                              isLearned(topic.id)
                                ? "line-through text-muted-foreground"
                                : "",
                            ].join(" ")}
                          >
                            {topic.title}
                          </h3>
                          {/* Learned badge — always visible in header when learned */}
                          {isLearned(topic.id) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-body font-medium bg-success/20 border border-success/40 text-success flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              Learned
                            </span>
                          )}
                        </button>

                        {/* Expandable body */}
                        <AnimatePresence initial={false}>
                          {isExpanded(topic.id) && (
                            <motion.div
                              key="body"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              style={{ overflow: "hidden" }}
                            >
                              <div className="mt-2 space-y-3">
                                {topic.notes && (
                                  <p className="text-sm font-body text-muted-foreground leading-relaxed whitespace-pre-wrap pl-6">
                                    {topic.notes}
                                  </p>
                                )}

                                <div className="pl-6">
                                  <SubTopicList
                                    topicId={topic.id}
                                    accentColor={color?.bg}
                                  />
                                </div>

                                {/* Action buttons inside expanded body */}
                                <div className="flex items-center gap-2 pl-6 pt-1">
                                  {/* Mark as learned toggle */}
                                  <button
                                    type="button"
                                    data-ocid={`topic.learned_toggle.${ocidIdx}`}
                                    onClick={() => toggleLearned(topic.id)}
                                    aria-label={
                                      isLearned(topic.id)
                                        ? `Mark "${topic.title}" as not learned`
                                        : `Mark "${topic.title}" as learned`
                                    }
                                    aria-pressed={isLearned(topic.id)}
                                    className={[
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-body font-medium transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                      isLearned(topic.id)
                                        ? "bg-success/20 border-success/40 text-success hover:bg-success/30"
                                        : "bg-transparent border-border text-muted-foreground hover:border-success/50 hover:text-success hover:bg-success/10",
                                    ].join(" ")}
                                  >
                                    {isLearned(topic.id) ? (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5" />
                                    )}
                                    {isLearned(topic.id)
                                      ? "Learned"
                                      : "Mark as learned"}
                                  </button>
                                  {/* Delete button */}
                                  <button
                                    type="button"
                                    data-ocid={`topic.delete_button.${ocidIdx}`}
                                    onClick={() =>
                                      handleRemoveTopic(topic.id, topic.title)
                                    }
                                    disabled={removeTopic.isPending}
                                    aria-label={`Remove topic ${topic.title}`}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                                  >
                                    {removeTopic.isPending ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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

        {/* Past Papers section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <BookOpen
              className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0"
              aria-hidden="true"
            />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Past Papers
              {pastPapers && pastPapers.length > 0 && (
                <span className="ml-2 text-sm font-body font-normal text-muted-foreground">
                  ({pastPapers.length})
                </span>
              )}
            </h2>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <PastPaperList subjectId={subjectId} accentColor={color?.bg} />
          </div>
        </motion.div>
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
