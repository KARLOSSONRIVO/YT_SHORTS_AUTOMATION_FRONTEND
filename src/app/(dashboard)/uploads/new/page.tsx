"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/features/auth/components/auth-provider";
import { UploadForm } from "@/features/uploads/components/upload-form";

export default function UploadPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Upload"
        title="Start a new source project"
        description="Keep the upload surface calm and focused. Everything long-running should move into the project monitoring flow after submit."
      />
      <UploadForm userId={user?.id ?? ""} />
    </div>
  );
}
