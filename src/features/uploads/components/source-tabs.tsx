import Link from "next/link";
import { Upload, Link2, ListVideo } from "lucide-react";
import { appRoutes } from "@/lib/constants/routes";
export function SourceTabs({
  active,
}: {
  active: "file" | "youtube" | "queue";
}) {
  const items = [
    {
      id: "file",
      label: "Upload a video",
      href: appRoutes.createProject,
      icon: Upload,
    },
    {
      id: "youtube",
      label: "YouTube link",
      href: appRoutes.youtubeSource,
      icon: Link2,
    },
    {
      id: "queue",
      label: "Finished clip",
      href: appRoutes.createProject + "?queue=1",
      icon: ListVideo,
    },
  ];
  return (
    <nav
      aria-label="Video source"
      className="flex flex-wrap gap-1 border-b pb-3"
    >
      {items.map(({ id, label, href, icon: Icon }) => (
        <Link
          key={id}
          href={href}
          aria-current={active === id ? "page" : undefined}
          className={
            "flex min-h-10 items-center gap-2 rounded-control px-3 text-sm " +
            (active === id
              ? "bg-accent font-medium text-primary"
              : "text-muted-foreground hover:bg-secondary")
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
