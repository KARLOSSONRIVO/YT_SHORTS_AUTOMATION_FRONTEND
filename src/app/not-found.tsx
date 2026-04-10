import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { appRoutes } from "@/lib/constants/routes";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <EmptyState
        title="This page slipped off the timeline"
        description="The route could not be found. Jump back to the dashboard and continue reviewing projects."
        ctaHref={appRoutes.dashboard}
        ctaLabel="Back to Dashboard"
      />
    </div>
  );
}
