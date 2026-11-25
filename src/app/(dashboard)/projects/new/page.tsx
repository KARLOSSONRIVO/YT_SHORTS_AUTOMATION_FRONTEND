"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreateProjectForm } from "@/features/automation/components/create-project-form";
import { UploadForm } from "@/features/uploads/components/upload-form";
function CreateProjectContent() {
  const search = useSearchParams();
  const editProjectId = search.get("edit") ?? undefined;
  return editProjectId || search.get("queue") === "1" ? (
    <CreateProjectForm editProjectId={editProjectId} />
  ) : (
    <UploadForm />
  );
}
export default function CreateProjectPage() {
  return (
    <Suspense fallback={<p aria-busy="true">Loading project setup...</p>}>
      <CreateProjectContent />
    </Suspense>
  );
}
