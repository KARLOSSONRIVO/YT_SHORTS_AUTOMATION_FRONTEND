"use client";

import { useEffect, useRef } from "react";

export type FilmstripFrame = { start: number; end: number; time: number };

function seekFrame(video: HTMLVideoElement, time: number, signal: AbortSignal) {
  return new Promise<boolean>((resolve) => {
    if (signal.aborted || video.error) {
      resolve(false);
      return;
    }

    function finish(success: boolean) {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
      video.removeEventListener("error", abort);
      video.removeEventListener("loadedmetadata", seek);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("seeked", ready);
      resolve(success);
    }

    const abort = () => finish(false);
    let target = time;
    function ready() {
      if (!video.seeking && video.readyState >= 2 && Math.abs(video.currentTime - target) < 0.05) finish(true);
    }

    function seek() {
      target = Math.min(time, Math.max(0, video.duration - 0.001));
      video.currentTime = target;
      ready();
    }

    const timeout = window.setTimeout(abort, 8000);
    signal.addEventListener("abort", abort, { once: true });
    video.addEventListener("error", abort, { once: true });
    video.addEventListener("loadeddata", ready);
    video.addEventListener("seeked", ready);
    if (video.readyState > 0) seek();
    else video.addEventListener("loadedmetadata", seek, { once: true });
  });
}

export function ClipFilmstrip({ src, start, end, frames, suspended }: {
  src: string;
  start: number;
  end: number;
  frames: FilmstripFrame[];
  suspended: boolean;
}) {
  const media = useRef<HTMLVideoElement | null>(null);
  const canvases = useRef(new Map<number, HTMLCanvasElement>());
  const painted = useRef(new WeakMap<HTMLCanvasElement, number>());

  useEffect(() => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = src;
    media.current = video;
    painted.current = new WeakMap();
    return () => {
      media.current = null;
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  useEffect(() => {
    const video = media.current;
    if (!video || suspended || !frames.length) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      for (const frame of frames) {
        const canvas = canvases.current.get(frame.start);
        if (!canvas || painted.current.get(canvas) === frame.time) continue;
        if (!(await seekFrame(video, frame.time, controller.signal)) || controller.signal.aborted) break;
        const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
        const width = video.videoWidth * scale;
        const height = video.videoHeight * scale;
        canvas.getContext("2d")?.drawImage(video, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        painted.current.set(canvas, frame.time);
      }
    }, 120);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [frames, src, suspended]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {frames.map((frame) => (
        <canvas
          key={frame.start}
          ref={(canvas) => {
            if (canvas) canvases.current.set(frame.start, canvas);
            else canvases.current.delete(frame.start);
          }}
          width={144}
          height={81}
          className="absolute inset-y-0 h-full border-r border-slate-950/70 object-cover"
          style={{ left: `${100 * (frame.start - start) / (end - start)}%`, width: `${100 * (frame.end - frame.start) / (end - start)}%` }}
        />
      ))}
    </div>
  );
}
