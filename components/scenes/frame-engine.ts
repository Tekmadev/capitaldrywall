/**
 * Shared frame-sequence engine for the scroll scenes (HeroSequence, BasementTransform).
 *
 * FrameSequence: fetches manifest.json, then every frame as a compressed Blob (6 at a time, key
 * frames first, then coarse to fine), and keeps only a small moving window of decoded bitmaps
 * (≈24) around the frame the scroll is heading to; evicted bitmaps are closed. FramePainter draws
 * the nearest decoded frame into a canvas with object-fit: cover maths, DPR capped at 2, redrawing
 * only when the frame changes and never while offscreen. Client only.
 */
import type { SequenceManifest } from "@/content/media";

export type FrameFolders = { desktop: string; mobile: string };

/** Same switch as the poster <picture>: the 9:16 set under 768 px or in portrait. */
export const MOBILE_SET_QUERY = "(max-width: 767px), (orientation: portrait)";

export function pickFolder(folders: FrameFolders): string {
  return window.matchMedia(MOBILE_SET_QUERY).matches ? folders.mobile : folders.desktop;
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Continuous stage position (0 … stages.length − 1) for a frame, linear between stage frames. */
export function stageValue(frame: number, stages: number[], frameCount: number): number {
  const marks = stages.length ? stages : [0, frameCount - 1];
  if (frame <= marks[0]) return 0;
  for (let i = 1; i < marks.length; i++) {
    if (frame <= marks[i]) {
      const span = marks[i] - marks[i - 1] || 1;
      return i - 1 + (frame - marks[i - 1]) / span;
    }
  }
  return marks.length - 1;
}

/** Evenly spaced stage frames when there is no manifest yet. */
export function evenStages(count: number, frameCount: number): number[] {
  return Array.from({ length: count }, (_, i) => Math.round((i / Math.max(1, count - 1)) * (frameCount - 1)));
}

type Decoded = {
  index: number;
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

async function decodeBlob(index: number, blob: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    return { index, source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  }
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  try {
    await img.decode();
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
  return {
    index,
    source: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    close: () => URL.revokeObjectURL(url),
  };
}

/** First frame and stage frames, then every 8th, 4th, 2nd, then the rest. */
function fetchOrder(m: SequenceManifest): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  const push = (i: number) => {
    if (i >= 0 && i < m.frames && !seen.has(i)) {
      seen.add(i);
      order.push(i);
    }
  };
  push(0);
  m.stages.forEach(push);
  push(m.frames - 1);
  for (const step of [8, 4, 2, 1]) for (let i = 0; i < m.frames; i += step) push(i);
  return order;
}

export type SequenceStatus = "idle" | "loading" | "ready" | "failed";

type SequenceOptions = {
  /** Most decoded bitmaps held at once (memory guard) */
  maxDecoded?: number;
  fetchConcurrency?: number;
  decodeConcurrency?: number;
};

export class FrameSequence {
  readonly folder: string;
  manifest: SequenceManifest | null = null;
  status: SequenceStatus = "idle";

  private blobs: (Blob | null | undefined)[] = [];
  private settled = 0;
  private decoded = new Map<number, Decoded>();
  private decoding = new Set<number>();
  private keep = new Set<number>();
  private target = 0;
  private dir = 1;
  private active = true;
  private destroyed = false;
  private abort = new AbortController();
  private listeners = new Set<() => void>();
  private started: Promise<boolean> | null = null;
  private readonly maxDecoded: number;
  private readonly fetchConcurrency: number;
  private readonly decodeConcurrency: number;

  constructor(folder: string, { maxDecoded = 24, fetchConcurrency = 6, decodeConcurrency = 2 }: SequenceOptions = {}) {
    this.folder = folder;
    this.maxDecoded = maxDecoded;
    this.fetchConcurrency = fetchConcurrency;
    this.decodeConcurrency = decodeConcurrency;
  }

  get frameCount(): number {
    return this.manifest?.frames ?? 0;
  }

  /** Share of frames fetched (or settled as missing), 0–1 */
  get fetchedRatio(): number {
    return this.manifest ? this.settled / this.manifest.frames : 0;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn();
  }

  /** Fetch the manifest and prove the first frame decodes (AVIF support). Resolves false on failure. */
  start(): Promise<boolean> {
    this.started ??= this.run();
    return this.started;
  }

  private async run(): Promise<boolean> {
    this.status = "loading";
    try {
      const res = await fetch(`${this.folder}/manifest.json`, { signal: this.abort.signal });
      if (!res.ok) throw new Error(`manifest ${res.status}`);
      const m = (await res.json()) as SequenceManifest;
      if (!m || !(m.frames > 0) || !Array.isArray(m.stages)) throw new Error("invalid manifest");
      this.manifest = m;
      this.blobs = new Array(m.frames);
      this.keep = new Set([0, m.frames - 1, ...m.stages.filter((i) => i >= 0 && i < m.frames)]);

      const first = await this.fetchFrame(0);
      if (!first) throw new Error("first frame missing");
      const decoded = await decodeBlob(0, first); // throws without AVIF support
      if (this.destroyed) {
        decoded.close();
        return false;
      }
      this.decoded.set(0, decoded);
      this.status = "ready";
      this.stream(fetchOrder(m).slice(1));
      this.emit();
      return true;
    } catch {
      if (!this.destroyed) {
        this.status = "failed";
        this.abort.abort();
        this.emit();
      }
      return false;
    }
  }

  private async fetchFrame(i: number): Promise<Blob | null> {
    const m = this.manifest;
    if (!m) return null;
    const url = `${this.folder}/${String(i + 1).padStart(m.pad, "0")}.${m.ext}`;
    try {
      const res = await fetch(url, { signal: this.abort.signal, priority: this.keep.has(i) ? "auto" : "low" });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      this.blobs[i] = blob;
      return blob;
    } catch {
      this.blobs[i] = null;
      return null;
    } finally {
      if (!this.destroyed) this.settled++;
    }
  }

  private stream(order: number[]) {
    let next = 0;
    const worker = async () => {
      while (next < order.length && !this.destroyed) {
        await this.fetchFrame(order[next++]);
        if (this.destroyed) return;
        this.pump();
        this.emit();
      }
    };
    for (let k = 0; k < this.fetchConcurrency; k++) void worker();
  }

  /** Where the scroll is heading (fractional frames allowed); decoding follows it. */
  setTarget(frame: number) {
    const n = this.frameCount;
    if (!n) return;
    const t = Math.min(n - 1, Math.max(0, frame));
    if (t !== this.target) this.dir = t > this.target ? 1 : -1;
    this.target = t;
    this.pump();
  }

  /**
   * Offscreen scenes stop decoding and release every bitmap (the compressed Blobs stay, and the
   * canvas keeps its last picture), so only the scene in view holds decoded memory.
   */
  setActive(active: boolean) {
    if (this.active === active) return;
    this.active = active;
    if (!active) {
      for (const d of this.decoded.values()) d.close();
      this.decoded.clear();
    } else {
      this.pump();
    }
  }

  /** The decoded frame closest to `frame`, or null. */
  nearest(frame: number): Decoded | null {
    let best: Decoded | null = null;
    let bestDist = Infinity;
    for (const d of this.decoded.values()) {
      const dist = Math.abs(d.index - frame);
      if (dist < bestDist) {
        best = d;
        bestDist = dist;
      }
    }
    return best;
  }

  has(frame: number): boolean {
    return this.decoded.has(Math.round(frame));
  }

  private pump() {
    if (this.destroyed || !this.active || !this.manifest) return;
    while (this.decoding.size < this.decodeConcurrency) {
      const i = this.pickNext();
      if (i < 0) return;
      this.decode(i);
    }
  }

  private wanted(i: number): boolean {
    return i >= 0 && i < this.frameCount && !!this.blobs[i] && !this.decoded.has(i) && !this.decoding.has(i);
  }

  private pickNext(): number {
    const center = Math.round(this.target);
    if (this.wanted(center) && this.makeRoom(center)) return center;
    // Stage frames are cheap insurance for fast scrubs (nearest-frame fallback lands on a stage).
    for (const i of this.keep) if (this.wanted(i)) return i;
    // Moving window, twice as deep ahead (in the scroll direction) as behind.
    const budget = this.maxDecoded - this.keep.size;
    for (let step = 1; step <= budget; step++) {
      const ahead = center + this.dir * step;
      if (this.wanted(ahead)) return this.makeRoom(ahead) ? ahead : -1;
      if (step % 2 === 0) {
        const behind = center - this.dir * (step / 2);
        if (this.wanted(behind)) return this.makeRoom(behind) ? behind : -1;
      }
    }
    return -1;
  }

  /** Free a slot for frame `i` by closing the farthest non-stage bitmap, if it is farther than `i`. */
  private makeRoom(i: number): boolean {
    if (this.keep.has(i)) return true;
    let held = this.decoding.size;
    for (const k of this.decoded.keys()) if (!this.keep.has(k)) held++;
    if (held < this.maxDecoded - this.keep.size) return true;
    let victim = -1;
    let victimDist = Math.abs(i - this.target);
    for (const k of this.decoded.keys()) {
      if (this.keep.has(k)) continue;
      const dist = Math.abs(k - this.target);
      if (dist > victimDist) {
        victim = k;
        victimDist = dist;
      }
    }
    if (victim < 0) return false;
    this.decoded.get(victim)?.close();
    this.decoded.delete(victim);
    return true;
  }

  private decode(i: number) {
    const blob = this.blobs[i];
    if (!blob) return;
    this.decoding.add(i);
    decodeBlob(i, blob).then(
      (d) => {
        this.decoding.delete(i);
        if (this.destroyed || !this.active) {
          d.close();
          return;
        }
        this.decoded.set(i, d);
        this.pump();
        this.emit();
      },
      () => {
        this.decoding.delete(i);
        this.blobs[i] = null;
        this.pump();
      },
    );
  }

  destroy() {
    this.destroyed = true;
    this.abort.abort();
    for (const d of this.decoded.values()) d.close();
    this.decoded.clear();
    this.blobs = [];
    this.listeners.clear();
  }
}

/** object-fit: cover, object-position: centre */
function drawCover(ctx: CanvasRenderingContext2D, d: Decoded, cw: number, ch: number) {
  const scale = Math.max(cw / d.width, ch / d.height);
  const w = d.width * scale;
  const h = d.height * scale;
  ctx.drawImage(d.source, (cw - w) / 2, (ch - h) / 2, w, h);
}

export class FramePainter {
  /** Called after each draw with the frame index that was painted */
  onDraw?: (index: number) => void;

  private readonly canvas: HTMLCanvasElement;
  private readonly seq: FrameSequence;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly ro: ResizeObserver;
  private readonly unsubscribe: () => void;
  private frame = 0;
  private drawn = -1;
  private dirty = true;
  private raf = 0;
  private visible = true;

  constructor(canvas: HTMLCanvasElement, seq: FrameSequence) {
    this.canvas = canvas;
    this.seq = seq;
    this.ctx = canvas.getContext("2d", { alpha: false });
    if (this.ctx) this.ctx.imageSmoothingQuality = "high";
    this.unsubscribe = seq.subscribe(() => this.request());
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
  }

  /** Show `frame` (fractional allowed); paints on the next animation frame if it changed. */
  setFrame(frame: number) {
    this.frame = frame;
    this.seq.setTarget(frame);
    this.request();
  }

  get currentFrame(): number {
    return this.frame;
  }

  /** Index of the frame currently on the canvas (−1 before the first paint) */
  get paintedFrame(): number {
    return this.drawn;
  }

  setVisible(visible: boolean) {
    if (this.visible === visible) return;
    this.visible = visible;
    this.seq.setActive(visible);
    if (visible) {
      this.dirty = true;
      this.request();
    }
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width === w && this.canvas.height === h) return;
    this.canvas.width = w;
    this.canvas.height = h;
    if (this.ctx) this.ctx.imageSmoothingQuality = "high";
    this.dirty = true;
    this.paint(); // resizing clears the canvas: repaint before the browser does
  }

  private request() {
    if (!this.raf && this.visible) this.raf = requestAnimationFrame(this.tick);
  }

  private tick = () => {
    this.raf = 0;
    this.paint();
  };

  private paint() {
    if (!this.visible || !this.ctx) return;
    const d = this.seq.nearest(this.frame);
    if (!d) return;
    if (d.index === this.drawn && !this.dirty) return;
    drawCover(this.ctx, d, this.canvas.width, this.canvas.height);
    this.drawn = d.index;
    this.dirty = false;
    this.onDraw?.(d.index);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.unsubscribe();
    this.onDraw = undefined;
  }
}
