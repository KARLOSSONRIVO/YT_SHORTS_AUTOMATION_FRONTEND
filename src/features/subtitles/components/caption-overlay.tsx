"use client";

import { Fragment, useRef } from "react";
import type { PointerEvent } from "react";
import type { CaptionPlacement } from "@/features/clips/types";
import type { ProjectSubtitlePreferences } from "@/features/projects/types";
import { activeCaptionWord, type CaptionBlock } from "../lib/caption-blocks";
import { captionFontFamily } from "../lib/caption-presets";

const verticalPositions = { top_center: 0.14, middle_center: 0.50, bottom_center: 0.86 } as const;

export function CaptionOverlay({ block, time, preferences, placement, onStartMove, onMove }: {
  block: CaptionBlock;
  time: number;
  preferences: ProjectSubtitlePreferences;
  placement?: CaptionPlacement;
  onStartMove: () => void;
  onMove: (position: CaptionPlacement) => void;
}) {
  const drag = useRef<{ x: number; y: number; origin: CaptionPlacement } | null>(null);
  const position = placement ?? { x: 0.5, y: verticalPositions[preferences.position] };
  const activeWord = preferences.preset === "bold_stroke" ? undefined : activeCaptionWord(block, time);

  function moveInsideFrame(element: HTMLButtonElement, next: CaptionPlacement) {
    const frame = element.parentElement;
    if (!frame) return;
    const insetX = Math.min(0.5, Math.max(0.05, (element.offsetWidth / 2 + 3) / frame.clientWidth));
    const insetY = Math.min(0.5, Math.max(0.05, (element.offsetHeight / 2 + 3) / frame.clientHeight));
    onMove({ x: Math.max(insetX, Math.min(1 - insetX, next.x)), y: Math.max(insetY, Math.min(1 - insetY, next.y)) });
  }

  function movePointer(event: PointerEvent<HTMLButtonElement>) {
    const start = drag.current;
    const frame = event.currentTarget.parentElement;
    if (!start || !frame || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    if (event.clientX === start.x && event.clientY === start.y && !placement) return;
    moveInsideFrame(event.currentTarget, {
      x: start.origin.x + (event.clientX - start.x) / frame.clientWidth,
      y: start.origin.y + (event.clientY - start.y) / frame.clientHeight,
    });
  }

  return (
    <button
      type="button"
      aria-label="Move captions"
      title="Drag captions or use the arrow keys"
      className="absolute max-w-[90%] -translate-x-1/2 -translate-y-1/2 touch-none cursor-move select-none text-center leading-tight hover:outline hover:outline-1 hover:outline-cyan-300 focus-visible:outline-cyan-300"
      style={{
        left: `${position.x * 100}%`, top: `${position.y * 100}%`,
        width: "max-content",
        color: preferences.fillColor,
        fontSize: `${Math.max(Math.floor(preferences.fontSize * 0.72), 17) / 10.8}cqw`,
        fontFamily: captionFontFamily(preferences.fontFamily),
        fontWeight: preferences.fontFamily === "Anton" ? 400 : 700,
        WebkitTextStroke: `0.7cqw ${preferences.strokeColor}`,
        paintOrder: "stroke fill",
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        onStartMove();
        drag.current = { x: event.clientX, y: event.clientY, origin: position };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={movePointer}
      onPointerUp={movePointer}
      onLostPointerCapture={() => { drag.current = null; }}
      onKeyDown={(event) => {
        const offset = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
        if (!offset) return;
        event.preventDefault();
        const step = event.shiftKey ? 0.05 : 0.01;
        moveInsideFrame(event.currentTarget, { x: position.x + offset[0] * step, y: position.y + offset[1] * step });
      }}
    >
      {block.lines.map((line, index) => (
        <span key={index} className="block break-words">
          {line.map((word, wordIndex) => {
            const karaoke = word === activeWord && preferences.preset === "karaoke";
            return (
              <Fragment key={wordIndex}>
                {wordIndex > 0 ? " " : null}
                <span style={karaoke ? { backgroundColor: preferences.highlightColor, boxShadow: `0 0 0 .12em ${preferences.highlightColor}` }
                  : word === activeWord ? { color: preferences.highlightColor } : undefined}>
                  {preferences.preset === "custom" ? word.text : word.text.toUpperCase()}
                </span>
              </Fragment>
            );
          })}
        </span>
      ))}
    </button>
  );
}
