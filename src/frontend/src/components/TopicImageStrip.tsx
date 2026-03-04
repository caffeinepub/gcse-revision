import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageIcon, Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { TopicId, TopicImageId } from "../backend.d";
import {
  useAddTopicImage,
  useRemoveTopicImage,
  useTopicImages,
} from "../hooks/useQueries";

interface TopicImageStripProps {
  topicId: TopicId;
  accentColor?: string;
}

export default function TopicImageStrip({
  topicId,
  accentColor,
}: TopicImageStripProps) {
  const { data: images, isLoading } = useTopicImages(topicId);
  const addTopicImage = useAddTopicImage();
  const removeTopicImage = useRemoveTopicImage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogImageUrl, setDialogImageUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes);
      await addTopicImage.mutateAsync({ topicId, blob });
      toast.success("Image added!");
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemove(topicImageId: TopicImageId, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await removeTopicImage.mutateAsync({ topicImageId, topicId });
      toast.success("Image removed.");
    } catch {
      toast.error("Failed to remove image.");
    }
  }

  function handleThumbnailClick(url: string) {
    setDialogImageUrl(url);
    setDialogOpen(true);
  }

  const hasImages = images && images.length > 0;

  return (
    <div data-ocid="topic.image_strip" className="mt-2 mb-1">
      {/* Images row */}
      {isLoading ? (
        <div className="flex gap-2 overflow-x-auto py-1">
          {[1, 2].map((k) => (
            <div
              key={k}
              className="w-[108px] h-[108px] flex-shrink-0 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="flex items-start gap-2 overflow-x-auto py-1 scrollbar-thin">
          {/* Thumbnails */}
          {hasImages &&
            images.map((img, idx) => {
              const url = img.blob.getDirectURL();
              const ocidIdx = idx + 1;
              return (
                <button
                  key={img.id.toString()}
                  type="button"
                  data-ocid={`topic.image_item.${ocidIdx}`}
                  className="relative flex-shrink-0 w-[108px] h-[108px] group/img cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                  onClick={() => handleThumbnailClick(url)}
                  aria-label={`View attached photo ${ocidIdx}`}
                >
                  <img
                    src={url}
                    alt={`Attachment ${ocidIdx}`}
                    className="w-full h-full object-cover rounded-xl border border-border shadow-sm transition-all duration-200 group-hover/img:shadow-md group-hover/img:scale-[1.02]"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 rounded-xl bg-foreground/0 group-hover/img:bg-foreground/20 transition-all duration-200" />
                  {/* Delete button */}
                  <button
                    type="button"
                    data-ocid={`topic.image_delete_button.${ocidIdx}`}
                    onClick={(e) => handleRemove(img.id, e)}
                    disabled={removeTopicImage.isPending}
                    aria-label={`Remove attached photo ${ocidIdx}`}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover/img:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {/* Colour accent dot */}
                  {accentColor && (
                    <div
                      className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full opacity-80"
                      style={{ backgroundColor: accentColor }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}

          {/* Upload button */}
          <div className="flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              id={`topic-img-upload-${topicId}`}
              className="sr-only"
              onChange={handleFileChange}
              disabled={addTopicImage.isPending}
            />
            <label
              data-ocid="topic.image_upload_button"
              htmlFor={`topic-img-upload-${topicId}`}
              className={[
                "inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-body font-medium border transition-all cursor-pointer select-none",
                "border-dashed border-border text-muted-foreground",
                addTopicImage.isPending
                  ? "pointer-events-none opacity-60"
                  : "hover:border-foreground/30 hover:text-foreground hover:bg-secondary/60 focus-within:ring-1 focus-within:ring-ring",
              ].join(" ")}
              aria-label="Add image to this topic"
            >
              {addTopicImage.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Adding…</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>Add image</span>
                </>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Empty hint when no images yet */}
      {!isLoading && !hasImages && (
        <p className="text-[10px] font-body text-muted-foreground/50 italic mt-0.5 pl-0.5">
          No images attached
        </p>
      )}

      {/* Full-size image dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="topic.image_dialog"
          className="max-w-[95vw] w-full p-0 overflow-hidden rounded-2xl"
          aria-describedby="topic-image-dialog-desc"
        >
          <DialogHeader className="px-5 pt-5 pb-3 flex flex-row items-center justify-between">
            <DialogTitle className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              Topic Image
            </DialogTitle>
          </DialogHeader>
          <p id="topic-image-dialog-desc" className="sr-only">
            Full-size view of the selected topic image
          </p>
          {dialogImageUrl && (
            <div className="px-5 pb-5">
              <img
                src={dialogImageUrl}
                alt="Full-size view of selected attachment"
                className="w-full h-auto rounded-xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
