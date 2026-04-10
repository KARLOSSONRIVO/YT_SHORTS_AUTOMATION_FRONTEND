"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Expand, LoaderCircle, Minimize, PauseCircle, PlayCircle, TriangleAlert, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils/format";
import type { ClipSubtitleSegment } from "@/features/clips/types";

function formatPlaybackTime(totalSeconds: number) {
  return formatDuration(Math.max(0, Math.floor(totalSeconds)));
}

export function VideoPlayer({
  title,
  src,
  status,
  clipStartSeconds,
  clipEndSeconds,
  subtitleSegments,
  className
}: {
  title: string;
  src?: string;
  status?: "queued" | "rendering" | "rendered" | "failed";
  clipStartSeconds?: number;
  clipEndSeconds?: number;
  subtitleSegments?: ClipSubtitleSegment[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [segmentElapsedSeconds, setSegmentElapsedSeconds] = useState(0);
  const isSegmentPreview =
    Boolean(src) &&
    typeof clipStartSeconds === "number" &&
    typeof clipEndSeconds === "number" &&
    status !== "rendered";
  const segmentDurationSeconds = useMemo(() => {
    if (!isSegmentPreview || typeof clipStartSeconds !== "number" || typeof clipEndSeconds !== "number") {
      return 0;
    }

    return Math.max(0, clipEndSeconds - clipStartSeconds);
  }, [clipEndSeconds, clipStartSeconds, isSegmentPreview]);
  const activeSubtitle = useMemo(() => {
    if (!subtitleSegments?.length) {
      return undefined;
    }

    return subtitleSegments.find(
      (segment) => segmentElapsedSeconds >= segment.start && segmentElapsedSeconds <= segment.end
    );
  }, [segmentElapsedSeconds, subtitleSegments]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || typeof clipStartSeconds !== "number" || typeof clipEndSeconds !== "number" || status === "rendered") {
      return;
    }

    const handleLoadedMetadata = () => {
      video.currentTime = clipStartSeconds;
      setSegmentElapsedSeconds(0);
    };

    const handlePlay = () => {
      if (video.currentTime < clipStartSeconds || video.currentTime > clipEndSeconds) {
        video.currentTime = clipStartSeconds;
      }

       setIsPlaying(true);
    };

    const handleTimeUpdate = () => {
      setSegmentElapsedSeconds(Math.max(0, video.currentTime - clipStartSeconds));

      if (video.currentTime >= clipEndSeconds) {
        video.pause();
        video.currentTime = clipEndSeconds;
        setSegmentElapsedSeconds(Math.max(0, clipEndSeconds - clipStartSeconds));
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [clipEndSeconds, clipStartSeconds, status, src]);

  useEffect(() => {
    if (!isSegmentPreview) {
      setIsPlaying(false);
      setSegmentElapsedSeconds(0);
    }
  }, [isSegmentPreview, src]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleTogglePlayback = async () => {
    const video = videoRef.current;

    if (!video || !isSegmentPreview || typeof clipStartSeconds !== "number" || typeof clipEndSeconds !== "number") {
      return;
    }

    if (video.currentTime < clipStartSeconds || video.currentTime >= clipEndSeconds) {
      video.currentTime = clipStartSeconds;
      setSegmentElapsedSeconds(0);
    }

    if (video.paused) {
      await video.play().catch(() => undefined);
      return;
    }

    video.pause();
  };

  const handleSeekSegment = (value: string) => {
    const video = videoRef.current;

    if (!video || !isSegmentPreview || typeof clipStartSeconds !== "number") {
      return;
    }

    const nextElapsedSeconds = Number(value);

    if (Number.isNaN(nextElapsedSeconds)) {
      return;
    }

    video.currentTime = clipStartSeconds + nextElapsedSeconds;
    setSegmentElapsedSeconds(nextElapsedSeconds);
  };

  const handleToggleFullscreen = async () => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (document.fullscreenElement === container) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }

    await container.requestFullscreen().catch(() => undefined);
  };

  if (src && status === "rendered") {
    return (
      <div
        ref={containerRef}
        className={cn(
          "group relative overflow-hidden rounded-[28px] border border-border/80 bg-slate-950 shadow-soft",
          isFullscreen && "h-screen w-screen rounded-none border-0",
          className
        )}
      >
        <button
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white opacity-0 backdrop-blur transition hover:bg-black/60 group-hover:opacity-100"
          onClick={() => {
            void handleToggleFullscreen();
          }}
          type="button"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </button>
        <video
          ref={videoRef}
          className={cn("aspect-[9/16] w-full bg-black object-cover", isFullscreen && "h-screen w-full object-contain")}
          controls
          playsInline
          preload="metadata"
          src={src}
        />
      </div>
    );
  }

  if (src && isSegmentPreview) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "group relative overflow-hidden rounded-[28px] border border-border/80 bg-slate-950 shadow-soft",
          isFullscreen && "h-screen w-screen rounded-none border-0",
          className
        )}
      >
        <div className="border-b border-white/10 bg-slate-950/90 px-4 py-3 text-xs font-medium uppercase tracking-[0.24em] text-white/60">
          <div className="flex items-center justify-between gap-3">
            <span>Source Segment Preview</span>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
              onClick={() => {
                void handleToggleFullscreen();
              }}
              type="button"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <video
          ref={videoRef}
          className={cn("aspect-[9/16] w-full bg-black object-cover", isFullscreen && "h-[calc(100vh-9.75rem)] w-full object-contain")}
          playsInline
          preload="metadata"
          src={src}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-[5.75rem] flex justify-center px-4">
          <div className="max-w-[90%] rounded-[1.25rem] bg-black/58 px-4 py-3 text-center shadow-[0_16px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">9:16 Shorts Preview</p>
            <p className="text-base font-black uppercase leading-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.75)] sm:text-lg">
              {activeSubtitle?.text ?? "Subtitles will appear here during playback."}
            </p>
          </div>
        </div>
        <div className={cn("space-y-4 bg-slate-950 px-4 py-4 text-white", isFullscreen && "mx-auto w-full max-w-3xl")}>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
            <span>
              Clip Window {formatPlaybackTime(clipStartSeconds)} - {formatPlaybackTime(clipEndSeconds)}
            </span>
            <span>{formatPlaybackTime(segmentDurationSeconds)}</span>
          </div>
          <input
            aria-label="Clip preview progress"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#f97316]"
            max={segmentDurationSeconds}
            min={0}
            onChange={(event) => handleSeekSegment(event.target.value)}
            step={0.1}
            type="range"
            value={Math.min(segmentElapsedSeconds, segmentDurationSeconds)}
          />
          <div className="flex items-center justify-between gap-4">
            <button
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              onClick={() => {
                void handleTogglePlayback();
              }}
              type="button"
            >
              {isPlaying ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
              {isPlaying ? "Pause Clip" : "Play Clip"}
            </button>
            <div className="text-right text-sm text-white/75">
              <p>
                {formatPlaybackTime(segmentElapsedSeconds)} / {formatPlaybackTime(segmentDurationSeconds)}
              </p>
              <p className="text-xs text-white/50">You are previewing only the selected Shorts segment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusCopy =
    status === "rendering"
      ? {
          icon: LoaderCircle,
          eyebrow: "Rendering",
          description: "A source-segment preview should appear here first. The final rendered Short will replace it once rendering finishes."
        }
      : status === "failed"
        ? {
          icon: TriangleAlert,
          eyebrow: "Render Failed",
          description: "Rendered output failed, but the clip can still be reviewed from the source segment once the source media link is available."
        }
        : status === "queued"
          ? {
              icon: VideoOff,
              eyebrow: "Awaiting Preview",
              description: "Source-segment playback should appear here so you can review the clip before approving render."
            }
          : {
              icon: PlayCircle,
              eyebrow: "Preview",
              description: "A playable video will appear here once a rendered clip is available."
            };

  const Icon = statusCopy.icon;

  return (
    <div
      className={cn(
        "relative flex aspect-[9/16] items-center justify-center overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(30,41,59,0.94),rgba(17,24,39,0.98))] text-white",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.32),_transparent_35%)]" />
      <div className="relative flex max-w-[18rem] flex-col items-center gap-3 px-6 text-center">
        <Icon className={cn("h-14 w-14 text-white/90", status === "rendering" ? "animate-spin" : "")} />
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/60">{statusCopy.eyebrow}</p>
          <p className="mt-2 max-w-[18rem] text-lg font-semibold">{title}</p>
          <p className="mt-3 text-sm leading-6 text-white/70">{statusCopy.description}</p>
        </div>
      </div>
    </div>
  );
}
