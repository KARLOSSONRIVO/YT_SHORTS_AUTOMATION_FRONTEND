"use client";

import { useToast } from "@/components/common/toast";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import type { CaptionPreset, ProjectSubtitlePreferences } from "@/features/projects/types";
import { CaptionOverlay } from "@/features/subtitles/components/caption-overlay";
import { buildCaptionBlocks } from "@/features/subtitles/lib/caption-blocks";
import { CAPTION_FONT_SIZE, captionPresetLabels } from "@/features/subtitles/lib/caption-presets";
import type { CaptionPlacement, ClipRange, ClipSubtitleSegment, SourceCrop, VerticalLayout } from "../types";
import { ClipTimeline } from "./clip-timeline";

type Mode = VerticalLayout["mode"];
type CropKind = "gameplay" | "camera";
type Point = { x: number; y: number };

const layouts = [
  { mode: "gameplay", label: "Gameplay", description: "Gameplay fills the frame" },
  { mode: "split", label: "Split", description: "Facecam above gameplay" },
  { mode: "facecam", label: "Facecam", description: "Facecam over gameplay" },
] as const;
const clamp = (value: number, limit: number) => Math.min(Math.max(value, 0), limit);

function sourceCrop(center: Point, aspect: number, regionAspect: number, size: number): SourceCrop {
  const width = Math.min(regionAspect / aspect, 1) * size;
  const height = Math.min(aspect / regionAspect, 1) * size;
  return {
    x: clamp(center.x - width / 2, 1 - width),
    y: clamp(center.y - height / 2, 1 - height),
    width,
    height,
  };
}

export function VerticalClipEditor({
  src, range, originalRange, suspended, onRangeChange, onLayout, subtitleSegments, captionPreferences,
  captionPreset, captionPlacement, hasCustomCaptionSize, onCaptionPresetChange, onCaptionPlacementChange, onCaptionSizeChange
}: {
  src: string;
  range: ClipRange;
  originalRange: ClipRange;
  suspended?: boolean;
  onRangeChange: (range: ClipRange) => void;
  onLayout: (layout: VerticalLayout | null) => void;
  subtitleSegments?: ClipSubtitleSegment[];
  captionPreferences: ProjectSubtitlePreferences;
  captionPreset?: CaptionPreset;
  captionPlacement?: CaptionPlacement;
  hasCustomCaptionSize: boolean;
  onCaptionPresetChange: (preset: CaptionPreset | undefined) => void;
  onCaptionPlacementChange: (placement: CaptionPlacement | undefined) => void;
  onCaptionSizeChange: (size: number | undefined) => void;
}) {
  const { startTimeSeconds: start, endTimeSeconds: end } = range;
  const showToast = useToast();
  const captionSizeId = useId();
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const source = useRef<HTMLDivElement>(null);
  const drag = useRef<{ kind: CropKind; pointer: Point; center: Point } | null>(null);
  const [mode, setMode] = useState<Mode>("gameplay");
  const [aspect, setAspect] = useState(0);
  const [sourceDuration, setSourceDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(start);
  const [selected, setSelected] = useState<CropKind>("gameplay");
  const [centers, setCenters] = useState({ gameplay: { x: 0.5, y: 0.5 }, camera: { x: 0.17, y: 0.82 } });
  const [sizes, setSizes] = useState({ gameplay: 1, camera: 0.28 });

  useEffect(() => {
    if (suspended) video.current?.pause();
  }, [suspended]);

  const gameplay = sourceCrop(centers.gameplay, aspect || 16 / 9, 1080 / (mode === "split" ? 1280 : 1920), sizes.gameplay);
  const camera = sourceCrop(centers.camera, aspect || 16 / 9, mode === "split" ? 1080 / 640 : 378 / 250, sizes.camera);

  useEffect(() => {
    if (failed) {
      onLayout(null);
      return;
    }
    if (!aspect) return;
    const gameplay = sourceCrop(centers.gameplay, aspect, 1080 / (mode === "split" ? 1280 : 1920), sizes.gameplay);
    const camera = sourceCrop(centers.camera, aspect, mode === "split" ? 1080 / 640 : 378 / 250, sizes.camera);
    onLayout(mode === "gameplay" ? { mode, gameplay } : { mode, gameplay, camera });

    const media = video.current;
    const context = canvas.current?.getContext("2d");
    if (!media || !context) return;

    let frame = 0;
    const paint = () => {
      if (media.seeking || media.readyState < 2) return false;
      const draw = (crop: SourceCrop, x: number, y: number, width: number, height: number) => {
        context.drawImage(media,
          crop.x * media.videoWidth, crop.y * media.videoHeight,
          crop.width * media.videoWidth, crop.height * media.videoHeight,
          x / 2, y / 2, width / 2, height / 2);
      };

      if (mode === "split") {
        draw(camera, 0, 0, 1080, 640);
        draw(gameplay, 0, 640, 1080, 1280);
      } else {
        draw(gameplay, 0, 0, 1080, 1920);
        if (mode === "facecam") draw(camera, 36, 36, 378, 250);
      }
      return true;
    };
    const animate = () => {
      if (!media.paused && media.currentTime >= end) {
        media.pause();
        media.currentTime = end;
        setTime(end);
        return;
      }
      const painted = paint();
      if (playing && painted) {
        setTime((previous) => Math.abs(previous - media.currentTime) >= 0.045 ? media.currentTime : previous);
      }
      if (playing || !painted) frame = requestAnimationFrame(animate);
    };
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(animate);
    };
    refresh();
    media.addEventListener("seeking", refresh);
    media.addEventListener("seeked", refresh);
    const decodedFrame = media.requestVideoFrameCallback?.(refresh);
    return () => {
      cancelAnimationFrame(frame);
      if (decodedFrame !== undefined) media.cancelVideoFrameCallback(decodedFrame);
      media.removeEventListener("seeking", refresh);
      media.removeEventListener("seeked", refresh);
    };
  }, [aspect, centers, mode, sizes, playing, onLayout, failed, end]);

  function pointerPosition(event: PointerEvent<HTMLButtonElement>): Point {
    const bounds = source.current!.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
  }

  function moveCrop(kind: CropKind, crop: SourceCrop, point: Point) {
    setCenters((previous) => ({
      ...previous,
      [kind]: {
        x: clamp(point.x - crop.width / 2, 1 - crop.width) + crop.width / 2,
        y: clamp(point.y - crop.height / 2, 1 - crop.height) + crop.height / 2,
      },
    }));
  }

  function cropControl(kind: CropKind, crop: SourceCrop) {
    const label = kind === "camera" ? "Facecam" : "Gameplay";
    const active = selected === kind;
    return (
      <button
        key={kind}
        type="button"
        aria-label={`Move ${label.toLowerCase()} crop with arrow keys`}
        aria-pressed={active}
        className={`absolute touch-none cursor-move border-2 text-left outline-offset-2 ${active ? "z-10" : ""} ${kind === "camera" ? "border-amber-300 text-amber-200" : "border-cyan-300 text-cyan-200"}`}
        style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.width * 100}%`, height: `${crop.height * 100}%` }}
        onFocus={() => setSelected(kind)}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          setSelected(kind);
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { kind, pointer: pointerPosition(event), center: { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 } };
        }}
        onPointerMove={(event) => {
          const origin = drag.current;
          if (origin?.kind !== kind || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
          const point = pointerPosition(event);
          moveCrop(kind, crop, {
            x: origin.center.x + point.x - origin.pointer.x,
            y: origin.center.y + point.y - origin.pointer.y,
          });
        }}
        onLostPointerCapture={() => { drag.current = null; }}
        onKeyDown={(event) => {
          const offsets: Record<string, Point> = {
            ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
            ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
          };
          const step = offsets[event.key];
          if (!step) return;
          event.preventDefault();
          moveCrop(kind, crop, {
            x: crop.x + crop.width / 2 + step.x * 0.01,
            y: crop.y + crop.height / 2 + step.y * 0.01,
          });
        }}
      >
        <span className="absolute left-0 top-0 bg-black/80 px-1.5 py-0.5 text-xs font-medium">{label}</span>
      </button>
    );
  }

  function seekTo(position: number) {
    const media = video.current;
    if (!media) return;
    media.pause();
    media.currentTime = position;
    setTime(position);
  }

  function togglePlayback() {
    const media = video.current;
    if (!media) return;
    if (!media.paused) {
      media.pause();
      return;
    }
    if (media.currentTime < start || media.currentTime >= end) media.currentTime = start;
    void media.play().catch((error: Error) => {
      if (error.name !== "AbortError" && !media.error) {
        showToast({ tone: "error", title: "Source playback could not start" });
      }
    });
  }

  const { maxCharsPerLine, maxLines } = captionPreferences;
  const captionBlocks = useMemo(() => buildCaptionBlocks(
    subtitleSegments ?? [], { startTimeSeconds: start, endTimeSeconds: end }, { maxCharsPerLine, maxLines }
  ), [subtitleSegments, start, end, maxCharsPerLine, maxLines]);
  const liveCaption = captionBlocks.find((block) => time >= block.start && time < block.end);
  const caption = liveCaption ?? (!playing ? captionBlocks.find((block) => block.start >= time) ?? captionBlocks.at(-1) : undefined);
  return (
    <section aria-label="Vertical clip editor" className="space-y-4">
      <fieldset className="space-y-2" disabled={!aspect || failed}>
        <legend className="mb-2 text-sm font-semibold text-white">Vertical layout</legend>
        <div className="flex flex-wrap gap-2">
          {layouts.map(({ mode: value, label, description }) => (
            <label key={value} className="cursor-pointer rounded-control border border-slate-600 px-3 py-2 text-sm text-slate-200 has-[:checked]:border-cyan-300 has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-cyan-300">
              <input
                className="sr-only"
                type="radio"
                name="vertical-layout"
                checked={mode === value}
                onChange={() => {
                  setMode(value);
                  setSelected(value === "gameplay" ? "gameplay" : "camera");
                }}
                aria-describedby={mode === value ? "vertical-layout-description" : undefined}
              />
              {label}
              {mode === value && <span id="vertical-layout-description" className="sr-only">{description}</span>}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid items-start gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))]">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium text-slate-300">Source framing</p>
          <div ref={source} className="relative overflow-hidden rounded-control bg-black" style={{ aspectRatio: aspect || 16 / 9 }}>
            <video
              ref={video}
              src={src}
              className="absolute inset-0 h-full w-full"
              preload="auto"
              playsInline
              onLoadedMetadata={(event) => {
                const media = event.currentTarget;
                if (media.videoWidth && media.videoHeight) setAspect(media.videoWidth / media.videoHeight);
                media.currentTime = start;
              }}
              onDurationChange={(event) => {
                const length = event.currentTarget.duration;
                if (Number.isFinite(length) && length > 0) setSourceDuration(length);
              }}
              onError={() => {
                setFailed(true);
                showToast({ tone: "error", title: "Source preview could not be loaded", message: "You can still approve the standard render." });
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onTimeUpdate={(event) => {
                const media = event.currentTarget;
                if (!media.paused && media.currentTime >= end) {
                  media.pause();
                  if (media.currentTime > end) media.currentTime = end;
                }
                setTime(media.currentTime);
              }}
            />
            {!failed && aspect > 0 && cropControl("gameplay", gameplay)}
            {!failed && aspect > 0 && mode !== "gameplay" && cropControl("camera", camera)}
          </div>
          {failed ? (
            <p role="alert" className="text-xs text-slate-300">The source video could not be loaded. Approving will use the standard render.</p>
          ) : aspect ? (
            <>
              <label className="flex items-center gap-3 text-xs text-slate-300">
                {selected === "camera" ? "Facecam" : "Gameplay"} crop size
                <input className="min-w-0 flex-1 accent-cyan-300" type="range" min={0.2} max={1} step={0.01}
                  value={sizes[selected]} onChange={(event) => {
                    const size = Number(event.target.value);
                    setSizes((previous) => ({ ...previous, [selected]: size }));
                  }} />
              </label>
              <p className="text-xs text-slate-300">Drag a crop to frame the shot.</p>
            </>
          ) : (
            <p role="status" className="text-xs text-slate-300">Loading source video…</p>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium text-slate-300">9:16 preview</p>
          <div className="relative max-w-[240px] overflow-hidden rounded-control [container-type:inline-size]">
            <canvas width={540} height={960} ref={canvas} aria-label="Vertical crop preview" className="block aspect-[9/16] w-full bg-black" />
            {caption && !failed && (
              <CaptionOverlay
                block={caption}
                time={liveCaption ? time : caption.start}
                preferences={captionPreferences}
                placement={captionPlacement}
                onStartMove={() => video.current?.pause()}
                onMove={onCaptionPlacementChange}
              />
            )}
          </div>
          {captionBlocks.length > 0 && !failed && (
            <div className="max-w-[240px] space-y-1.5 text-xs text-slate-300">
              <label className="flex flex-wrap items-center justify-between gap-2">
                Caption style
                <select value={captionPreset ?? ""} onChange={(event) => onCaptionPresetChange(event.target.value as CaptionPreset || undefined)}
                  className="min-h-8 max-w-full rounded-control border border-slate-600 bg-slate-900 px-2 text-slate-100 focus-visible:outline-cyan-300">
                  <option value="">Project style</option>
                  {Object.entries(captionPresetLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={captionSizeId}>Caption size</label>
                  <div className="flex items-center gap-2">
                    {hasCustomCaptionSize && <button type="button" className="text-cyan-200 hover:underline" onClick={() => onCaptionSizeChange(undefined)}>Reset size</button>}
                    <output htmlFor={captionSizeId} className="min-w-5 text-right tabular-nums text-slate-100">{captionPreferences.fontSize}</output>
                  </div>
                </div>
                <input id={captionSizeId} type="range" min={CAPTION_FONT_SIZE.min} max={CAPTION_FONT_SIZE.max}
                  value={captionPreferences.fontSize} onChange={(event) => onCaptionSizeChange(Number(event.target.value))}
                  className="block h-8 w-full accent-cyan-300 focus-visible:outline-cyan-300" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>Drag captions to position them.</span>
                {captionPlacement && <button type="button" className="text-cyan-200 hover:underline" onClick={() => onCaptionPlacementChange(undefined)}>Reset placement</button>}
              </div>
            </div>
          )}
        </div>
      </div>
      {!failed && aspect > 0 && sourceDuration > 0 && (
        <ClipTimeline
          src={src}
          range={range}
          originalRange={originalRange}
          sourceDuration={sourceDuration}
          time={time}
          playing={playing}
          onPlay={togglePlayback}
          onSeek={seekTo}
          onChange={(next, position) => {
            onRangeChange(next);
            seekTo(position);
          }}
        />
      )}
      {!failed && aspect > 0 && sourceDuration === 0 && (
        <Button type="button" size="sm" variant="secondary" onClick={togglePlayback}>{playing ? "Pause" : "Play"}</Button>
      )}
    </section>
  );
}
