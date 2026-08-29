import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");
const read = (rel) => readFileSync(path.join(root, rel), "utf8");

test("SidebarContent is the single shared source for rail and drawer", () => {
  assert.match(read("components/layout/sidebar-nav.tsx"), /export function SidebarContent\b/);
  assert.match(
    read("components/layout/mobile-nav.tsx"),
    /import\s*\{[^}]*\bSidebarContent\b[^}]*\}\s*from\s*["']\.\/sidebar-nav["']/
  );
});

test("the rail is desktop-only", () => {
  assert.match(read("components/layout/sidebar-nav.tsx"), /hidden lg:flex/);
});

test("the hamburger is present, mobile-only, and accessible", () => {
  const topbar = read("components/layout/topbar.tsx");
  assert.match(topbar, /lg:hidden/);
  assert.match(topbar, /aria-label=/);
  assert.match(topbar, /aria-expanded=/);
  assert.match(topbar, /aria-controls=/);
});

test("the shell reserves the rail column only at lg and scales padding", () => {
  const shell = read("components/layout/dashboard-shell.tsx");
  assert.match(shell, /lg:ml-\[280px\]/);
  assert.doesNotMatch(shell, /(?<!lg:)\bml-\[280px\]/);
  assert.match(shell, /p-4 sm:p-6 lg:p-10/);
});

test("the drawer honours reduced motion and closes on navigation", () => {
  const drawer = read("components/layout/mobile-nav.tsx");
  assert.match(drawer, /motion-reduce:transition-none/);
  assert.match(drawer, /usePathname/);
});
