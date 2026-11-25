"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Minus, Pause, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils/format";
import type { ClipRange } from "../types";
import { ClipFilmstrip } from "./clip-filmstrip";

type Edge = keyof ClipRange;
type Drag = { pointerId: number; clientX: number; move: (clientX: number) => void };

const MIN_DURATION = 0.1;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const roundTime = (value: number) => Math.round(value * 100) / 100;

function tickInterval(visibleSeconds: number, width: number) {
  const desired = visibleSeconds / Math.max(3, Math.floor(width / 92));
  const magnitude = 10 ** Math.floor(Math.log10(desired));
  return ([1, 2, 5, 10].find((step) => step * magnitude >= desired) ?? 10) * magnitude;
}

export function ClipTimeline({ src, range, originalRange, sourceDuration, time, playing, onPlay, onSeek, onChange }: {
  src: string;
  range: ClipRange;
  originalRange: ClipRange;
  sourceDuration: number;
  time: number;
  playing: boolean;
  onPlay: () => void;
  onSeek: (time: number) => void;
  onChange: (range: ClipRange, time: number) => void;
}) {
  const [zoomLength, setZoomLength] = useState(() => Math.max((originalRange.endTimeSeconds - originalRange.startTimeSeconds) * 2, 12));
  const [scrollTime, setScrollTime] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const frame = useRef(0);
  const start = Math.min(range.startTimeSeconds, sourceDuration);
  const end = Math.min(range.endTimeSeconds, sourceDuration);
  const minimumWindow = Math.min(sourceDuration, Math.max(1, sourceDuration / 8192));
  const visibleSeconds = clamp(zoomLength, minimumWindow, sourceDuration);
  const zoomSpan = Math.log(sourceDuration / minimumWindow);
  const zoomValue = zoomSpan ? Math.round(100 * Math.log(sourceDuration / visibleSeconds) / zoomSpan) : 0;
  const interval = tickInterval(visibleSeconds, viewportWidth);
  const firstTick = Math.max(0, Math.floor(scrollTime / interval));
  const lastTick = Math.min(Math.floor(sourceDuration / interval), Math.ceil((scrollTime + visibleSeconds) / interval) + 1);
  const ticks = Array.from({ length: Math.max(0, lastTick - firstTick + 1) }, (_, index) => (firstTick + index) * interval);
  const frames = useMemo(() => {
    if (viewportWidth <= 40 || end <= start) return [];
    const laneWidth = viewportWidth * sourceDuration / visibleSeconds - 40;
    const tileSeconds = sourceDuration * Math.max(88, viewportWidth / 12) / laneWidth;
    const visibleStart = Math.max(start, scrollTime);
    const visibleEnd = Math.min(end, scrollTime + sourceDuration * viewportWidth / laneWidth);
    if (visibleEnd <= visibleStart) return [];
    const first = Math.floor(visibleStart / tileSeconds);
    const last = Math.ceil(visibleEnd / tileSeconds);
    return Array.from({ length: Math.max(0, last - first) }, (_, index) => {
      const tileStart = (first + index) * tileSeconds;
      const tileEnd = Math.min(tileStart + tileSeconds, sourceDuration);
      return { start: tileStart, end: tileEnd, time: (Math.max(tileStart, start) + Math.min(tileEnd, end)) / 2 };
    });
  }, [end, scrollTime, sourceDuration, start, viewportWidth, visibleSeconds]);
  const percent = (seconds: number) => `${100 * clamp(seconds, 0, sourceDuration) / sourceDuration}%`;
  const initialCenter = (originalRange.startTimeSeconds + originalRange.endTimeSeconds) / 2;
  const zoomTarget = useRef<number | null>(null);

  const showTime = useCallback((seconds: number, center: boolean) => {
    const scroller = viewport.current;
    const lane = track.current;
    if (!scroller || !lane) return;
    const offset = lane.offsetLeft + seconds * lane.offsetWidth / sourceDuration;
    if (center || offset < scroller.scrollLeft + 24 || offset > scroller.scrollLeft + scroller.clientWidth - 24) {
      scroller.scrollLeft = offset - scroller.clientWidth / 2;
    }
  }, [sourceDuration]);

  useLayoutEffect(() => {
    showTime(zoomTarget.current ?? initialCenter, true);
    zoomTarget.current = null;
  }, [initialCenter, showTime, visibleSeconds]);

  useLayoutEffect(() => {
    if (playing && !drag.current) showTime(time, false);
  }, [time, playing, showTime]);

  useLayoutEffect(() => () => cancelAnimationFrame(frame.current), []);

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const resize = new ResizeObserver(() => setViewportWidth(element.clientWidth));
    resize.observe(element);
    return () => resize.disconnect();
  }, []);

  function zoomTo(seconds: number, anchor?: number) {
    zoomTarget.current = anchor ?? (time >= scrollTime && time <= scrollTime + visibleSeconds
      ? time : scrollTime + visibleSeconds / 2);
    setZoomLength(clamp(seconds, minimumWindow, sourceDuration));
  }

  function setEdge(edge: Edge, timestamp: number) {
    const position = edge === "startTimeSeconds"
      ? clamp(roundTime(timestamp), 0, Math.max(0, end - MIN_DURATION))
      : clamp(roundTime(timestamp), Math.min(sourceDuration, start + MIN_DURATION), sourceDuration);
    const next = { startTimeSeconds: start, endTimeSeconds: end, [edge]: position };
    onChange(next, position);
    return position;
  }

  function stopDrag() {
    drag.current = null;
    cancelAnimationFrame(frame.current);
    setDragging(false);
  }

  function startDrag(event: PointerEvent<HTMLDivElement | HTMLButtonElement>, edge?: Edge) {
    const lane = track.current;
    const scroller = viewport.current;
    if (!lane || !scroller || !event.isPrimary || event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const timestampAt = (clientX: number) => {
      const bounds = lane.getBoundingClientRect();
      return sourceDuration * (clientX - bounds.left) / bounds.width;
    };
    let previous = edge ? range[edge] : -1;
    const offset = edge ? previous - timestampAt(event.clientX) : 0;
    const move = (clientX: number) => {
      const timestamp = clamp(roundTime(timestampAt(clientX) + offset), 0, sourceDuration);
      if (Math.abs(previous - timestamp) < 0.005) return;
      previous = timestamp;
      if (edge) setEdge(edge, timestamp);
      else onSeek(timestamp);
    };
    drag.current = { pointerId: event.pointerId, clientX: event.clientX, move };
    if (edge) onSeek(range[edge]);
    else move(event.clientX);
    setDragging(true);

    const panAtEdge = () => {
      const current = drag.current;
      if (!current) return;
      const { left, right } = scroller.getBoundingClientRect();
      const speed = current.clientX > right - 28 ? current.clientX - right + 28
        : current.clientX < left + 28 ? current.clientX - left - 28 : 0;
      if (speed) {
        const previousScroll = scroller.scrollLeft;
        scroller.scrollLeft += clamp(speed / 4, -18, 18);
        if (scroller.scrollLeft !== previousScroll) current.move(current.clientX);
      }
      frame.current = requestAnimationFrame(panAtEdge);
    };
    frame.current = requestAnimationFrame(panAtEdge);
  }

  function nudge(event: KeyboardEvent<HTMLButtonElement>, edge?: Edge) {
    const value = edge ? range[edge] : time;
    const step = event.shiftKey ? 1 : 0.1;
    let next: number;
    switch (event.key) {
      case "ArrowLeft": case "ArrowDown": next = value - step; break;
      case "ArrowRight": case "ArrowUp": next = value + step; break;
      case "Home": next = 0; break;
      case "End": next = sourceDuration; break;
      default: return;
    }
    event.preventDefault();
    const position = edge ? setEdge(edge, next) : clamp(roundTime(next), 0, sourceDuration);
    if (!edge) onSeek(position);
    showTime(position, false);
  }

  return (
    <section aria-label="Clip timeline" className="min-w-0 space-y-2 rounded-control border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold text-white">Clip timeline</h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-200 sm:gap-x-3">
          <div role="group" aria-label="Timeline scale" className="flex items-center gap-1.5">
            <button type="button" aria-label="Zoom out" title="Zoom out" disabled={visibleSeconds >= sourceDuration}
              onClick={() => zoomTo(visibleSeconds * 2)} className="grid size-8 place-items-center rounded-control border border-slate-700 hover:bg-slate-800 disabled:opacity-40">
              <Minus aria-hidden="true" className="size-3.5" />
            </button>
            <input type="range" min={0} max={100} value={zoomValue} aria-label="Timeline zoom" aria-valuetext={`${formatDuration(visibleSeconds)} visible`}
              disabled={!zoomSpan} onChange={(event) => zoomTo(sourceDuration * Math.exp(-zoomSpan * Number(event.target.value) / 100))}
              className="h-8 w-16 accent-cyan-300 sm:w-24" />
            <button type="button" aria-label="Zoom in" title="Zoom in" disabled={visibleSeconds <= minimumWindow}
              onClick={() => zoomTo(visibleSeconds / 2)} className="grid size-8 place-items-center rounded-control border border-slate-700 hover:bg-slate-800 disabled:opacity-40">
              <Plus aria-hidden="true" className="size-3.5" />
            </button>
          </div>
          <button type="button" className="min-h-8 underline-offset-4 hover:underline focus-visible:outline-cyan-300"
            onClick={() => visibleSeconds === sourceDuration ? zoomTo(Math.max((end - start) * 1.15, minimumWindow), (start + end) / 2) : zoomTo(sourceDuration)}>
            {visibleSeconds === sourceDuration ? "Zoom to clip" : "Full source"}
          </button>
          <button type="button" className="min-h-8 text-slate-200 underline-offset-4 hover:underline focus-visible:outline-cyan-300" onClick={() => {
            onChange(originalRange, originalRange.startTimeSeconds);
            zoomTo(Math.max((originalRange.endTimeSeconds - originalRange.startTimeSeconds) * 2, 12), initialCenter);
            showTime(initialCenter, true);
          }}>Reset range</button>
        </div>
      </div>
      <div
        ref={viewport}
        className={`relative min-w-0 overflow-x-auto overscroll-x-contain rounded-control bg-slate-950 [scrollbar-color:#64748b_#0f172a] ${dragging ? "select-none" : ""}`}
        onScroll={(event) => {
          const lane = track.current;
          if (lane) setScrollTime(sourceDuration * event.currentTarget.scrollLeft / lane.offsetWidth);
        }}
        onPointerMove={(event) => {
          if (drag.current?.pointerId !== event.pointerId) return;
          drag.current.clientX = event.clientX;
          drag.current.move(event.clientX);
        }}
        onPointerUp={(event) => {
          if (drag.current?.pointerId !== event.pointerId) return;
          drag.current.move(event.clientX);
          stopDrag();
        }}
        onPointerCancel={stopDrag}
        onLostPointerCapture={stopDrag}
      >
        <div className="box-border px-5" style={{ width: `${sourceDuration / visibleSeconds * 100}%` }}>
          <div ref={track} className="relative h-[5.75rem] touch-none cursor-crosshair" onPointerDown={startDrag}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-7 text-[10px] tabular-nums text-slate-300"
              style={{ backgroundImage: "repeating-linear-gradient(to right, rgb(71 85 105) 0 1px, transparent 1px 100%)", backgroundSize: `${100 * interval / 5 / sourceDuration}% 4px`, backgroundPosition: "bottom", backgroundRepeat: "repeat-x" }}>
              {ticks.map((tick) => (
                <span key={tick} className={`absolute bottom-0 border-slate-600 pb-1 ${sourceDuration - tick < interval * 0.2 ? "-translate-x-full border-r pr-1" : "border-l pl-1"}`} style={{ left: percent(tick) }}>{formatDuration(tick)}</span>
              ))}
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-7 h-14 rounded-control border border-slate-700 bg-slate-800" />
            <div aria-hidden="true" className="pointer-events-none absolute top-7 h-14 overflow-hidden border-y-2 border-cyan-300 bg-cyan-300/20" style={{ left: percent(start), right: percent(sourceDuration - end) }}>
              <ClipFilmstrip key={src} src={src} start={start} end={end} frames={frames} suspended={dragging || playing} />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-300/80" />
            </div>
            {([
              { edge: "startTimeSeconds", label: "Clip start", value: start, min: 0, max: Math.max(0, end - MIN_DURATION) },
              { edge: "endTimeSeconds", label: "Clip end", value: end, min: Math.min(sourceDuration, start + MIN_DURATION), max: sourceDuration },
            ] as const).map(({ edge, label, value, min, max }) => (
              <button
                type="button" key={edge} role="slider" aria-label={label} title={label} aria-valuemin={min} aria-valuemax={max}
                aria-valuenow={value} aria-valuetext={formatDuration(value)}
                className={`absolute top-6 z-20 grid h-16 w-5 touch-none cursor-ew-resize place-items-center border-y-4 border-slate-950 bg-cyan-300 text-slate-950 hover:bg-cyan-100 focus-visible:z-30 focus-visible:outline-white ${edge === "startTimeSeconds" ? "-translate-x-full" : ""}`}
                style={{ left: percent(value) }}
                onPointerDown={(event) => startDrag(event, edge)} onKeyDown={(event) => nudge(event, edge)}
              >
                <span aria-hidden="true" className="h-3 w-1.5 border-x border-current" />
              </button>
            ))}
            <button
              type="button" role="slider" aria-label="Timeline playhead" aria-valuemin={0} aria-valuemax={sourceDuration}
              aria-valuenow={clamp(time, 0, sourceDuration)} aria-valuetext={formatDuration(time)}
              className="absolute top-4 z-10 h-[4.4rem] w-5 -translate-x-1/2 touch-none cursor-ew-resize focus-visible:z-30 focus-visible:outline-white"
              style={{ left: percent(time) }} onKeyDown={(event) => nudge(event)}
            >
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white before:absolute before:-left-[3px] before:-top-0.5 before:h-1.5 before:w-[7px] before:bg-white" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs tabular-nums text-slate-200">
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={onPlay}>
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            {playing ? "Pause" : "Play"}
          </Button>
          <span aria-label="Source position">{formatDuration(time)} / {formatDuration(sourceDuration)}</span>
        </div>
        <span aria-label="Selected clip range">{formatDuration(start)} – {formatDuration(end)} <span className="text-slate-400">· {formatDuration(end - start)} selected</span></span>
      </div>
    </section>
  );
}
