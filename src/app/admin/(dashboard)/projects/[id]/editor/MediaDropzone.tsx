"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { requestAssetUpload, confirmAssetUploaded, deleteAssetByUrl } from "@/app/admin/actions/media";
import { mediaKindOf } from "@/lib/media";
import { sniffFileKind, type SniffedKind } from "@/lib/sniffFileKind";

const DEFAULT_ACCEPT: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

export const IMAGE_OR_VIDEO_ACCEPT: Record<string, string[]> = {
  ...DEFAULT_ACCEPT,
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
  "video/webm": [".webm"],
};

export const AUDIO_ACCEPT: Record<string, string[]> = {
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
  "audio/mp4": [".m4a"],
};

interface UploadingFile {
  tempId: string;
  name: string;
  previewUrl: string;
  error?: string;
}

export function MediaDropzone({
  projectId,
  items,
  onChange,
  multiple = true,
  maxItems = 8,
  accept = DEFAULT_ACCEPT,
  formatsLabel = "JPG, PNG, WEBP, GIF",
  dropLabel = "Kéo thả tệp vào đây hoặc nhấp để chọn",
}: {
  projectId: string;
  items: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxItems?: number;
  accept?: Record<string, string[]>;
  formatsLabel?: string;
  dropLabel?: string;
}) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);

  // Dropping several files fires several concurrent uploadOne calls, each
  // closing over `items` from the same render. Without this ref, whichever
  // upload's onChange(...items, fileUrl) fires last "wins" and stomps the
  // others' additions, since every call appends to that same stale snapshot
  // instead of each other's results — only the last file to finish survives.
  // The ref is mutated synchronously (no `await` between read and write), so
  // concurrent completions can't interleave and lose an update.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const uploadOne = useCallback(
    async (file: File) => {
      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const previewUrl = URL.createObjectURL(file);
      setUploading((prev) => [...prev, { tempId, name: file.name, previewUrl }]);

      // Which real file kinds this dropzone accepts, derived from its
      // `accept` MIME map — used to catch a file whose actual bytes don't
      // match its extension (e.g. a photo renamed to .mp3), which the
      // browser's file picker and the server's extension-based
      // Content-Type never catch.
      const allowedKinds = new Set<SniffedKind>(
        Object.keys(accept).map((mime) => mime.split("/")[0] as SniffedKind)
      );
      const sniffed = await sniffFileKind(file);
      if (sniffed !== "unknown" && !allowedKinds.has(sniffed)) {
        setUploading((prev) =>
          prev.map((u) =>
            u.tempId === tempId ? { ...u, error: "Tệp không đúng định dạng" } : u
          )
        );
        window.setTimeout(() => {
          setUploading((prev) => prev.filter((u) => u.tempId !== tempId));
        }, 3000);
        return;
      }

      try {
        const { assetId, signedUrl, fileUrl, contentType } = await requestAssetUpload(
          projectId,
          file.name
        );

        const res = await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: file,
        });
        if (!res.ok) throw new Error("UPLOAD_FAILED");

        await confirmAssetUploaded(assetId);

        const next = multiple ? [...itemsRef.current, fileUrl] : [fileUrl];
        itemsRef.current = next;
        onChange(next);
      } catch {
        setUploading((prev) =>
          prev.map((u) => (u.tempId === tempId ? { ...u, error: "Tải lên thất bại" } : u))
        );
        window.setTimeout(() => {
          setUploading((prev) => prev.filter((u) => u.tempId !== tempId));
        }, 3000);
        return;
      }

      URL.revokeObjectURL(previewUrl);
      setUploading((prev) => prev.filter((u) => u.tempId !== tempId));
    },
    [projectId, onChange, multiple, accept]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = multiple ? Math.max(0, maxItems - items.length) : 1;
      const files = acceptedFiles.slice(0, remaining || acceptedFiles.length);
      files.forEach(uploadOne);
    },
    [items.length, maxItems, multiple, uploadOne]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept,
    multiple,
    noClick: true,
    onDrop,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.indexOf(String(active.id));
    const to = items.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onChange(arrayMove(items, from, to));
  }

  function handleRemove(url: string) {
    onChange(items.filter((u) => u !== url));
    // Best-effort: also delete the S3 object + DB row. Not blocking the UI —
    // if this fails the file is simply orphaned in storage, not re-shown.
    deleteAssetByUrl(url).catch(() => {});
  }

  const canAddMore = multiple ? items.length + uploading.length < maxItems : items.length === 0;
  const isEmpty = items.length === 0 && uploading.length === 0;

  return (
    <div {...getRootProps()} className="relative">
      <input {...getInputProps()} />

      {isEmpty ? (
        <button
          type="button"
          onClick={open}
          className="flex w-full flex-col items-center gap-2 border border-dashed border-line bg-ivory-deep px-6 py-8 text-center transition-colors hover:border-accent"
        >
          <UploadIcon />
          <span className="font-serif text-ink">{dropLabel}</span>
          <span className="text-xs uppercase tracking-widest text-ink-soft">
            {formatsLabel}
          </span>
        </button>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {items.map((url) => (
                <SortableThumb key={url} url={url} onRemove={() => handleRemove(url)} />
              ))}
              {uploading.map((u) => (
                <div
                  key={u.tempId}
                  className="relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden border border-line bg-ivory-deep px-2 text-center"
                >
                  <span className="line-clamp-2 text-[11px] text-ink-soft">{u.name}</span>
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                    {u.error ? (
                      <span className="px-2 text-center text-xs text-ivory">{u.error}</span>
                    ) : (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
                    )}
                  </div>
                </div>
              ))}
              {canAddMore && (
                <button
                  type="button"
                  onClick={open}
                  className="flex aspect-square flex-col items-center justify-center gap-1 border border-dashed border-line text-ink-soft transition-colors hover:border-accent hover:text-accent"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="text-xs">Thêm</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-accent bg-accent/10">
          <span className="font-serif text-accent">Thả ảnh vào đây</span>
        </div>
      )}
    </div>
  );
}

function SortableThumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: url,
  });
  const kind = mediaKindOf(url);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
      className="group relative aspect-square cursor-grab overflow-hidden border border-line active:cursor-grabbing"
    >
      {kind === "video" ? (
        <video src={url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
      ) : kind === "audio" ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ivory-deep px-2 text-center">
          <AudioIcon />
          <span className="line-clamp-2 text-[11px] text-ink-soft">
            {url.split("/").pop()}
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-xs text-ivory opacity-0 transition-opacity group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

function AudioIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-ink-soft">
      <path
        d="M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-ink-soft">
      <path
        d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
