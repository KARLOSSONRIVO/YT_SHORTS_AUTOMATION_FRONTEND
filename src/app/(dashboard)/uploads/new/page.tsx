"use client";

import { useState } from "react";
import { UploadCloud, Video, MessageSquareText, CheckCircle2 } from "lucide-react";
import { FacelessProjectForm } from "@/features/faceless/components/faceless-project-form";
import { RedditStoryProjectForm } from "@/features/faceless/components/reddit-story-project-form";
import { UploadForm } from "@/features/uploads/components/upload-form";

export default function UploadPage() {
  const [mode, setMode] = useState<"clipping" | "faceless" | "reddit">("clipping");

  return (
    <div className="space-y-10">
      <div className="mb-10">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">New Project</h2>
        <p className="text-muted-foreground font-body text-base">Select a workflow to start your automated creation process.</p>
      </div>

      {/* Workflow Selection Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Clipping */}
        <div 
          onClick={() => setMode("clipping")}
          className={`group cursor-pointer bg-card rounded-xl p-6 border-2 transition-all duration-300 ${
            mode === "clipping" 
              ? "border-primary neon-glow-primary" 
              : "border-transparent hover:border-primary/30"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
              mode === "clipping" ? "bg-primary text-primary-foreground" : "bg-background text-primary"
            }`}>
              <UploadCloud className="h-6 w-6" />
            </div>
            {mode === "clipping" && (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground mb-2 leading-snug">Clip from uploaded video</h3>
          <p className="text-sm text-muted-foreground">Extract viral-ready short clips from your long-form raw footage.</p>
        </div>

        {/* Card 2: Faceless */}
        <div 
          onClick={() => setMode("faceless")}
          className={`group cursor-pointer bg-card rounded-xl p-6 border-2 transition-all duration-300 ${
            mode === "faceless" 
              ? "border-primary neon-glow-primary" 
              : "border-transparent hover:border-primary/30"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
              mode === "faceless" ? "bg-primary text-primary-foreground" : "bg-background text-primary"
            }`}>
              <Video className="h-6 w-6" />
            </div>
            {mode === "faceless" && (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground mb-2 leading-snug">Generate faceless story video</h3>
          <p className="text-sm text-muted-foreground">Create cinematic AI-generated stories with dynamic voiceovers and visuals.</p>
        </div>

        {/* Card 3: Reddit */}
        <div 
          onClick={() => setMode("reddit")}
          className={`group cursor-pointer bg-card rounded-xl p-6 border-2 transition-all duration-300 ${
            mode === "reddit" 
              ? "border-primary neon-glow-primary" 
              : "border-transparent hover:border-primary/30"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
              mode === "reddit" ? "bg-primary text-primary-foreground" : "bg-background text-primary"
            }`}>
              <MessageSquareText className="h-6 w-6" />
            </div>
            {mode === "reddit" && (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground mb-2 leading-snug">Generate faceless Reddit story</h3>
          <p className="text-sm text-muted-foreground">Turn trending Reddit threads into engaging TikTok/Shorts content.</p>
        </div>
      </section>

      {/* Forms Area */}
      <div className="mt-10">
        {mode === "clipping" ? <UploadForm /> : null}
        {mode === "faceless" ? <FacelessProjectForm /> : null}
        {mode === "reddit" ? <RedditStoryProjectForm /> : null}
      </div>
    </div>
  );
}
