import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const testDirectory = path.dirname(fileURLToPath(import.meta.url));

async function loadStoryCard() {
  const componentPath = path.join(
    testDirectory,
    "..",
    "src",
    "features",
    "automation",
    "components",
    "project-automation-dashboard.tsx",
  );
  const source = `${await readFile(componentPath, "utf8")}\nexports.__testStoryCard = StoryCard;`;
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  const icons = new Proxy({}, { get: () => () => null });
  const localRequire = (specifier) => {
    if (specifier === "react" || specifier === "react/jsx-runtime") return require(specifier);
    if (specifier === "lucide-react") return icons;
    if (specifier === "@/components/ui/button") {
      return { Button: ({ children, ...props }) => React.createElement("button", props, children) };
    }
    if (specifier === "@/components/common/status-badge") {
      return { StatusBadge: ({ children }) => React.createElement("span", null, children) };
    }
    return new Proxy({}, { get: () => () => null });
  };

  new Function("require", "module", "exports", compiled)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports.__testStoryCard;
}

test("posted story links to its platform URL instead of the local render", async () => {
  const StoryCard = await loadStoryCard();
  const markup = renderToStaticMarkup(
    React.createElement(StoryCard, {
      account: "StoriesReddit",
      onApprove() {},
      onReject() {},
      onRetryGeneration() {},
      onRetryUpload() {},
      story: {
        id: "story-1",
        metadata: {
          assignedAccount: "StoriesReddit",
          finalVideoUrl: "/outputs/reddit/rendered_video/faceless_story.mp4",
        },
        platformUrl: "https://www.youtube.com/watch?v=published-123",
        status: "uploaded",
        storyFormat: "hero_story",
        title: "A Reddit story",
        topic: "Reddit submission from r/relationships",
      },
    }),
  );

  assert.match(markup, /<a[^>]*href="https:\/\/www\.youtube\.com\/watch\?v=published-123"[^>]*>Open on YouTube<\/a>/);
  assert.doesNotMatch(markup, /outputs\/reddit\/rendered_video/);
  assert.match(markup, /target="_blank"/);
  assert.match(markup, /rel="noreferrer"/);
  assert.doesNotMatch(markup, /<video/);
});

test("posted story builds a YouTube watch link from its platform video ID", async () => {
  const StoryCard = await loadStoryCard();
  const markup = renderToStaticMarkup(
    React.createElement(StoryCard, {
      account: "StoriesReddit",
      onApprove() {},
      onReject() {},
      onRetryGeneration() {},
      onRetryUpload() {},
      story: {
        id: "story-2",
        metadata: {
          assignedAccount: "StoriesReddit",
          finalVideoUrl: "/outputs/reddit/rendered_video/faceless_story.mp4",
        },
        platformVideoId: "fallback-456",
        status: "uploaded",
        storyFormat: "hero_story",
        title: "Another Reddit story",
        topic: "Reddit submission from r/relationships",
      },
    }),
  );

  assert.match(markup, /<a[^>]*href="https:\/\/www\.youtube\.com\/watch\?v=fallback-456"[^>]*>Open on YouTube<\/a>/);
  assert.doesNotMatch(markup, /outputs\/reddit\/rendered_video/);
  assert.doesNotMatch(markup, /<video/);
});

test("Upload Now is shown only for stories with a scheduled upload", async () => {
  const StoryCard = await loadStoryCard();
  const renderStory = (story) => renderToStaticMarkup(
    React.createElement(StoryCard, {
      account: "StoriesHistory",
      onApprove() {},
      onReject() {},
      onRetryGeneration() {},
      onRetryUpload() {},
      onUploadNow() {},
      story: {
        id: "story-scheduled",
        status: "scheduled",
        storyFormat: "hero_story",
        title: "A scheduled story",
        topic: "A scheduled topic",
        ...story,
      },
    }),
  );

  assert.match(renderStory({ scheduledUploadTime: "2026-08-20T11:00:00.000Z" }), /Upload Now/);
  assert.doesNotMatch(renderStory({}), /Upload Now/);
  assert.doesNotMatch(renderStory({ status: "awaiting_approval", scheduledUploadTime: "2026-08-20T11:00:00.000Z" }), /Upload Now/);
});
