"use client";
import { useToast } from "@/components/common/toast";
import { useEffect, useRef, useState } from "react";
import {
  Expand,
  Minimize,
  Pause,
  Play,
  Loader2,
  VideoOff,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils/format";
import type { ClipSubtitleSegment } from "@/features/clips/types";
export function VideoPlayer({
  title,
  src,
  status,
  clipStartSeconds,
  clipEndSeconds,
  subtitleSegments,
  className,
}: {
  title: string;
  src?: string;
  status?: "queued" | "rendering" | "rendered" | "failed";
  clipStartSeconds?: number;
  clipEndSeconds?: number;
  subtitleSegments?: ClipSubtitleSegment[];
  className?: string;
}) {
  const showToast = useToast();
  const container = useRef<HTMLDivElement>(null),
    video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false),
    [fullscreen, setFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0),
    [failed, setFailed] = useState(false);
  const segment =
    status !== "rendered" &&
    typeof clipStartSeconds === "number" &&
    typeof clipEndSeconds === "number";
  const start = clipStartSeconds ?? 0,
    end = clipEndSeconds ?? 0,
    duration = Math.max(0, end - start);
  const caption = subtitleSegments?.find(
    (s) => elapsed >= s.start && elapsed <= s.end,
  );
  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
    setFailed(false);
  }, [src, clipStartSeconds, clipEndSeconds]);
  useEffect(() => {
    const change = () =>
      setFullscreen(document.fullscreenElement === container.current);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);
  const toggleFullscreen = async () => {
    if (!container.current) return;
    if (document.fullscreenElement === container.current)
      await document.exitFullscreen().catch(() => undefined);
    else await container.current.requestFullscreen().catch(() => undefined);
  };
  const togglePlayback = async () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      if (segment && (el.currentTime < start || el.currentTime >= end))
        el.currentTime = start;
      await el.play().catch((error: Error) => {
        if (error.name !== "AbortError" && !el.error) {
          showToast({ tone: "error", title: "Video playback could not start" });
        }
      });
    } else el.pause();
  };
  if (!src || failed)
    return (
      <div
        className={cn(
          "flex aspect-[9/16] max-h-[44dvh] flex-col items-center justify-center gap-3 rounded-control bg-slate-900 px-6 text-center text-white",
          className,
        )}
      >
        {status === "rendering" && !failed ? (
          <Loader2 className="h-7 w-7 animate-spin motion-reduce:animate-none" />
        ) : (
          <VideoOff className="h-7 w-7 text-slate-400" />
        )}
        <p className="text-sm font-medium">
          {failed
            ? "Preview could not be loaded"
            : status === "failed"
              ? "Render failed"
              : "Preparing preview"}
        </p>
        <p className="max-w-xs text-xs leading-5 text-slate-300">
          {failed
            ? "Check your connection and try loading this clip again."
            : "Your clip preview will appear here when it is available."}
        </p>
        {failed ? (
          <button
            type="button"
            onClick={() => setFailed(false)}
            className="mt-2 inline-flex items-center gap-2 rounded-control border border-slate-500 px-3 py-2 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Retry preview
          </button>
        ) : null}
      </div>
    );
  return (
    <div
      ref={container}
      className={cn(
        "group relative overflow-hidden rounded-control bg-black text-white",
        fullscreen &&
          "flex h-screen w-screen flex-col justify-center rounded-none",
        className,
      )}
    >
      <div className="relative">
        <video
          ref={video}
          src={src}
          controls={!segment}
          playsInline
          preload="metadata"
          aria-label={title}
          className={cn(
            "aspect-[9/16] max-h-[44dvh] w-full bg-black object-contain",
            fullscreen && "h-[calc(100dvh-90px)] max-h-none",
          )}
          onError={() => {
            setFailed(true);
            showToast({ tone: "error", title: "Video preview could not be loaded", message: "Try loading the preview again." });
          }}
          onLoadedMetadata={(e) => {
            if (segment) e.currentTarget.currentTime = start;
          }}
          onPlay={(e) => {
            if (
              segment &&
              (e.currentTarget.currentTime < start ||
                e.currentTarget.currentTime >= end)
            )
              e.currentTarget.currentTime = start;
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            if (!segment) return;
            const el = e.currentTarget;
            setElapsed(Math.max(0, el.currentTime - start));
            if (el.currentTime >= end && !el.paused) {
              el.pause();
              el.currentTime = end;
            }
          }}
        />
        <button
          type="button"
          aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={() => void toggleFullscreen()}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-control border border-white/20 bg-black/80 text-white opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          {fullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Expand className="h-4 w-4" />
          )}
        </button>
        {segment && caption ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 bottom-4 rounded-control bg-black/80 px-3 py-2 text-center text-sm font-bold uppercase leading-snug"
          >
            {caption.text}
          </div>
        ) : null}
      </div>
      {segment ? (
        <div className="space-y-2.5 bg-slate-950 p-3">
          <input
            type="range"
            aria-label="Clip preview progress"
            min={0}
            max={duration}
            step={0.1}
            value={Math.min(elapsed, duration)}
            onChange={(e) => {
              if (video.current)
                video.current.currentTime = start + Number(e.target.value);
              setElapsed(Number(e.target.value));
            }}
            className="block h-1.5 w-full cursor-pointer accent-blue-400"
          />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => void togglePlayback()}
              aria-label={playing ? "Pause clip" : "Play clip"}
              className="flex h-9 items-center gap-2 rounded-control bg-white px-3 text-xs font-medium text-slate-950 hover:bg-slate-200"
            >
              {playing ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {playing ? "Pause" : "Play"}
            </button>
            <span className="text-xs text-slate-300 tabular-nums">
              {formatDuration(Math.floor(elapsed))} / {formatDuration(duration)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
