"use client";
import { useSearchParams } from "next/navigation";
import { CreateProjectForm } from "@/features/automation/components/create-project-form";
export default function CreateProjectPage(){const search=useSearchParams();return <CreateProjectForm editProjectId={search.get("edit")??undefined}/>}
