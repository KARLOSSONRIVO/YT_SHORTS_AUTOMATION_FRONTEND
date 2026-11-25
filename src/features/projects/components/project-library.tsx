"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Grid2X2, List, Film, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { appRoutes } from "@/lib/constants/routes";
import { formatRelativeDate } from "@/lib/utils/format";
import type { Project } from "../types";
import { getProjectTone, isProjectActive } from "../lib/project-status";
import { ProjectCard } from "./project-card";
const filters = [
  "All projects",
  "Needs review",
  "Processing",
  "Completed",
] as const;
export function ProjectLibrary({
  projects,
  loading,
  limit,
}: {
  projects: Project[];
  loading?: boolean;
  limit?: number;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All projects");
  const [view, setView] = useState<"list" | "grid">("list");
  const matches = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.trim().toLowerCase()) &&
      (filter === "All projects" ||
        (filter === "Needs review" && p.status === "review") ||
        (filter === "Processing" && isProjectActive(p.status)) ||
        (filter === "Completed" &&
          ["completed", "published"].includes(p.status))),
  );
  const visible = limit ? matches.slice(0, limit) : matches;
  return (
    <section aria-label="Project library" className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-1" aria-label="Filter projects">
          {filters.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={
                "min-h-10 rounded-control px-3 text-sm transition-colors " +
                (filter === item
                  ? "bg-secondary font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60")
              }
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 xl:w-60">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search projects"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects"
              type="search"
            />
          </div>
          <div
            className="flex rounded-control border bg-card p-0.5"
            aria-label="Project view"
          >
            <Button
              type="button"
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading projects"
          className="space-y-3"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !visible.length ? (
        <EmptyState
          title={
            search || filter !== "All projects"
              ? "No matching projects"
              : "Your first clip starts here"
          }
          description={
            search || filter !== "All projects"
              ? "Try another name or select All projects."
              : "Add a source video or YouTube link. Your clips will be ready to review here."
          }
          ctaHref={!projects.length ? appRoutes.createProject : undefined}
          ctaLabel="Create a project"
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-container border bg-card">
          <div className="hidden grid-cols-[minmax(0,1fr)_150px_140px_24px] gap-4 border-b bg-background px-5 py-3 text-xs font-medium text-muted-foreground md:grid">
            <span>Project</span>
            <span>Status</span>
            <span>Last updated</span>
            <span />
          </div>
          {visible.map((project) => (
            <Link
              key={project.id}
              href={appRoutes.projects + "/" + project.id}
              className="group flex min-w-0 items-center gap-4 border-b px-4 py-4 last:border-0 hover:bg-background md:grid md:grid-cols-[minmax(0,1fr)_150px_140px_24px] md:px-5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-control border bg-background text-muted-foreground">
                  <Film className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium group-hover:text-primary">
                    {project.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {project.accountId ? "Finished clip queue" : "Source video"}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <StatusBadge tone={getProjectTone(project.status)}>
                  {project.status}
                </StatusBadge>
              </div>
              <p className="hidden text-xs text-muted-foreground md:block">
                {project.updatedAt
                  ? formatRelativeDate(project.updatedAt)
                  : "Just added"}
              </p>
              <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block" />
            </Link>
          ))}
        </div>
      )}
      {limit && matches.length > limit ? (
        <Button type="button" asChild variant="ghost">
          <Link href={appRoutes.projects}>
            View all {matches.length} projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : null}
    </section>
  );
}
