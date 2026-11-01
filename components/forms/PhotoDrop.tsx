"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type DragEvent, type Ref } from "react";
import { CrossIcon, TickIcon } from "@/components/ui/icons";
import { quoteErrors, quoteFields } from "@/content/copy/forms";
import { MAX_PHOTO_BYTES, MAX_PHOTOS, MAX_UPLOAD_BYTES, type QuotePhoto } from "@/lib/quote/schema";
import { cn } from "@/lib/utils";
import { FieldError } from "./fields";

type PhotoStatus = "compressing" | "uploading" | "done" | "preview" | "error";

export type PhotoItem = {
  id: string;
  name: string;
  /** Object URL (local file) or the uploaded blob URL */
  preview: string | null;
  status: PhotoStatus;
  /** 0–100 across compression (0–40) and upload (40–100) */
  progress: number;
  /** Bytes actually sent (after compression) */
  size?: number;
  url?: string;
};

export type PhotoDropHandle = {
  /** Resolves when every photo has finished (uploaded, preview-only or failed) with the uploaded ones */
  settle: () => Promise<QuotePhoto[]>;
  /** Re-show photos uploaded earlier in this tab (sessionStorage draft) */
  restore: (photos: QuotePhoto[]) => void;
};

/* One probe per page: 503 means uploads are off (no BLOB_READ_WRITE_TOKEN, the demo) */
let uploadsProbe: Promise<boolean> | null = null;
function uploadsEnabled(): Promise<boolean> {
  uploadsProbe ??= fetch("/api/upload", { cache: "no-store" })
    .then((res) => res.ok)
    .catch(() => false);
  return uploadsProbe;
}

const isImage = (file: File) => file.type.startsWith("image/") || /\.(heic|heif|avif)$/i.test(file.name);

/** quotes/YYYY/MM/<slug>.<ext> (the server adds a random suffix) */
function uploadPath(name: string): string {
  const now = new Date();
  const ext = (/\.([a-z0-9]{2,5})$/i.exec(name)?.[1] ?? "jpg").toLowerCase();
  const slug =
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "photo";
  return `quotes/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${slug}.${ext}`;
}

/**
 * Photo picker for the quote form: up to 6 images ≤ 10 MB, compressed in a web worker to ≤ 2 MB,
 * uploaded to Vercel Blob through /api/upload with per-photo progress. When uploads are off the
 * photos stay as local previews ("preview only") and the form still sends.
 */
export function PhotoDrop({
  id,
  onChange,
  handleRef,
  demoItems,
  className,
}: {
  id: string;
  /** Uploaded photos, whenever the list changes */
  onChange?: (photos: QuotePhoto[]) => void;
  handleRef?: Ref<PhotoDropHandle>;
  /** Static items for the kitchen sink */
  demoItems?: PhotoItem[];
  className?: string;
}) {
  const [items, setItems] = useState<PhotoItem[]>(() => demoItems ?? []);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const files = useRef(new Map<string, File>());
  const done = useRef(new Map<string, QuotePhoto>());
  const queue = useRef<Promise<void>>(Promise.resolve());
  const count = useRef(items.length);
  const seq = useRef(0);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const update = useCallback((itemId: string, patch: Partial<PhotoItem>) => {
    setItems((list) => list.map((it) => (it.id === itemId ? { ...it, ...patch } : it)));
  }, []);

  const emit = useCallback(() => onChangeRef.current?.([...done.current.values()]), []);

  const process = useCallback(
    async (itemId: string) => {
      const file = files.current.get(itemId);
      if (!file) return;
      const alive = () => files.current.has(itemId);

      update(itemId, { status: "compressing", progress: 2 });
      let out: File = file;
      try {
        const { default: compress } = await import("browser-image-compression");
        out = await compress(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 2560,
          useWebWorker: true,
          onProgress: (pct: number) => {
            if (alive()) update(itemId, { progress: Math.max(2, Math.round(pct * 0.4)) });
          },
        });
      } catch {
        out = file; // e.g. HEIC outside Safari: send the original if it fits
      }
      if (!alive()) return;
      update(itemId, { size: out.size });

      if (!(await uploadsEnabled())) {
        if (alive()) update(itemId, { status: "preview", progress: 100 });
        return;
      }
      if (out.size > MAX_UPLOAD_BYTES) {
        update(itemId, { status: "error", progress: 0 });
        return;
      }

      update(itemId, { status: "uploading", progress: 40 });
      try {
        const { upload } = await import("@vercel/blob/client");
        const blob = await upload(uploadPath(file.name), out, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: out.type || file.type || undefined,
          onUploadProgress: ({ percentage }) => {
            if (alive()) update(itemId, { progress: 40 + Math.round(percentage * 0.6) });
          },
        });
        if (!alive()) return;
        done.current.set(itemId, { url: blob.url, name: file.name.slice(0, 160) });
        update(itemId, { status: "done", progress: 100, url: blob.url });
        emit();
      } catch {
        // Uploads may have been switched off mid-session: fall back to preview-only
        uploadsProbe = null;
        const enabled = await uploadsEnabled();
        if (alive()) update(itemId, enabled ? { status: "error", progress: 0 } : { status: "preview", progress: 100 });
      }
    },
    [emit, update],
  );

  const enqueue = useCallback(
    (itemId: string) => {
      queue.current = queue.current.then(() => process(itemId));
    },
    [process],
  );

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (!incoming.length) return;
    const valid = incoming.filter((f) => isImage(f) && f.size <= MAX_PHOTO_BYTES);
    setError(valid.length < incoming.length ? quoteErrors.photos : null);
    const room = Math.max(0, MAX_PHOTOS - count.current);
    const accepted = valid.slice(0, room);
    if (!accepted.length) return;

    const added: PhotoItem[] = accepted.map((file) => {
      const itemId = `${id}-photo-${++seq.current}`;
      files.current.set(itemId, file);
      return { id: itemId, name: file.name, preview: URL.createObjectURL(file), status: "compressing", progress: 0 };
    });
    count.current += added.length;
    setItems((cur) => [...cur, ...added]);
    for (const it of added) enqueue(it.id);
  };

  const remove = (item: PhotoItem) => {
    if (item.preview?.startsWith("blob:")) URL.revokeObjectURL(item.preview);
    files.current.delete(item.id);
    done.current.delete(item.id);
    count.current = Math.max(0, count.current - 1);
    setItems((cur) => cur.filter((it) => it.id !== item.id));
    setError(null);
    emit();
  };

  useImperativeHandle(
    handleRef,
    () => ({
      settle: async () => {
        await queue.current;
        return [...done.current.values()];
      },
      restore: (photos) => {
        const restored: PhotoItem[] = photos.slice(0, MAX_PHOTOS).map((p) => {
          const itemId = `${id}-photo-${++seq.current}`;
          done.current.set(itemId, p);
          return { id: itemId, name: p.name ?? "photo", preview: p.url, status: "done", progress: 100, url: p.url };
        });
        count.current = restored.length;
        setItems(restored);
      },
    }),
    [id],
  );

  // Revoke object URLs on unmount; stop stray drops from navigating away from the form
  useEffect(() => {
    const filesMap = files.current;
    const prevent = (e: globalThis.DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
      filesMap.clear();
    };
  }, []);

  const full = items.length >= MAX_PHOTOS;
  const labelId = `${id}-label`;
  const inputId = `${id}-input`;
  const errorId = `${id}-error`;
  const countId = `${id}-count`;

  const onDrag = (e: DragEvent<HTMLLabelElement>, over: boolean) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    if (!full) setDragging(over);
  };

  return (
    <div className={cn("relative flex min-w-0 flex-col bg-[color:var(--surface)]", className)} data-qf-photos="">
      <div className="flex items-baseline justify-between gap-3 px-4 pb-1 pt-3.5">
        <span id={labelId} className="t-spec">
          {quoteFields.photos.label}
        </span>
        <span id={countId} className="t-spec text-[0.625rem]! tabular-nums opacity-90">
          {items.length} / {MAX_PHOTOS} · {quoteFields.photos.optional}
        </span>
      </div>

      <div className="px-4 pb-4 pt-2">
        <label
          htmlFor={inputId}
          onDragEnter={(e) => onDrag(e, true)}
          onDragOver={(e) => onDrag(e, true)}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
          }}
          onDrop={(e) => {
            if (!e.dataTransfer.types.includes("Files")) return;
            e.preventDefault();
            setDragging(false);
            if (!full) addFiles(e.dataTransfer.files);
          }}
          data-dragging={dragging || undefined}
          className={cn(
            "group/drop relative flex min-h-28 cursor-pointer items-center gap-4 border border-dashed px-5 py-5 transition-colors duration-200",
            "border-[color:color-mix(in_srgb,var(--ink)_32%,transparent)] hover:border-[color:var(--ink)] hover:bg-[color:var(--surface-raised)]",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-worklight has-[:focus-visible]:shadow-[0_0_0_4px_var(--color-graphite)]",
            "data-[dragging]:border-solid data-[dragging]:border-[color:var(--ink)] data-[dragging]:bg-[color:var(--surface-raised)]",
            full && "pointer-events-none opacity-50",
          )}
        >
          <input
            id={inputId}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            disabled={full}
            className="sr-only"
            aria-labelledby={`${labelId} ${inputId}-hint`}
            aria-describedby={cn(countId, error && errorId)}
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center border border-[color:var(--hairline)] bg-[color:var(--surface)] text-[color:var(--ink)] transition-transform duration-300 ease-[var(--ease-rake)] group-hover/drop:rotate-90 group-data-[dragging]/drop:rotate-90"
          >
            <CrossIcon size={20} />
          </span>
          <span id={`${inputId}-hint`} className="text-[0.9375rem] leading-snug text-[color:var(--ink)]">
            {quoteFields.photos.hint}
          </span>
        </label>

        <FieldError id={errorId} message={error ?? undefined} className="px-0 pb-0 pt-3" />

        {items.length > 0 && (
          <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-x-3 gap-y-4">
            {items.map((item, i) => (
              <PhotoThumb key={item.id} item={item} index={i} onRemove={() => remove(item)} onRetry={() => enqueue(item.id)} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PhotoThumb({
  item,
  index,
  onRemove,
  onRetry,
}: {
  item: PhotoItem;
  index: number;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const busy = item.status === "compressing" || item.status === "uploading";
  const n = String(index + 1).padStart(2, "0");
  const status =
    item.status === "compressing"
      ? "Compressing"
      : item.status === "uploading"
        ? `Uploading ${item.progress}%`
        : item.status === "preview"
          ? "Preview only"
          : item.status === "error"
            ? "Failed"
            : item.size
              ? `${(item.size / 1024 / 1024).toFixed(1)} MB`
              : "Uploaded";

  return (
    <li className="min-w-0">
      <div className="relative aspect-square overflow-hidden border border-[color:var(--hairline)] bg-[color:var(--surface-raised)]">
        {item.preview && !broken ? (
          // Local object URLs and blob previews can't go through next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.preview}
            alt=""
            className={cn("size-full object-cover transition-opacity duration-300", busy && "opacity-60")}
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="grid size-full place-items-center p-2 text-center">
            <span className="t-spec break-all text-[0.625rem]!">{item.name}</span>
          </span>
        )}

        {busy && (
          <span className="absolute inset-x-0 bottom-0 h-[3px] bg-graphite/30" aria-hidden="true">
            <span
              className="block h-full origin-left bg-graphite transition-transform duration-300 ease-[var(--ease-rake)]"
              style={{ transform: `scaleX(${item.progress / 100})` }}
            />
          </span>
        )}

        {item.status === "error" && (
          <button
            type="button"
            onClick={onRetry}
            className="absolute inset-0 grid place-items-center bg-graphite/70 text-plaster transition-colors hover:bg-graphite/80"
          >
            <span className="t-spec border-b border-plaster/60 pb-0.5 text-[0.6875rem]! text-plaster!">Retry</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove photo ${n}: ${item.name}`}
          className="group/rm absolute right-0 top-0 grid size-11 place-items-center"
        >
          <span className="grid size-7 place-items-center bg-graphite/85 text-plaster transition-colors group-hover/rm:bg-graphite">
            <svg viewBox="0 0 12 12" width={11} height={11} aria-hidden="true" focusable="false">
              <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
        </button>
      </div>

      {/* Figure caption: frame number + state, like the site's FIG. captions */}
      <p className="t-spec mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.625rem]! leading-snug">
        <span className="tabular-nums">{n}</span>
        <span aria-hidden="true">·</span>
        {item.status === "done" && <TickIcon size={11} className="text-[color:var(--ink)]" />}
        <span
          className={cn(
            "tabular-nums",
            item.status === "error" && "text-[color:var(--error)]!",
            item.status === "done" && "text-[color:var(--ink)]",
          )}
        >
          {status}
        </span>
        <span className="sr-only">{item.name}</span>
      </p>
    </li>
  );
}
