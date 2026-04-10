import { apiUpload } from "@/lib/api/client";
import type { UploadResponse } from "../types";

export async function createUpload(input: {
  userId: string;
  title: string;
  description?: string;
  fontFamily: string;
  fontSize: number;
  fillColor: string;
  strokeColor: string;
  highlightColor: string;
  position: "bottom_center" | "top_center";
  maxCharsPerLine: number;
  maxLines: number;
  video: File;
}) {
  const formData = new FormData();
  formData.append("userId", input.userId);
  formData.append("title", input.title);
  if (input.description) formData.append("description", input.description);
  formData.append("fontFamily", input.fontFamily);
  formData.append("fontSize", `${input.fontSize}`);
  formData.append("fillColor", input.fillColor);
  formData.append("strokeColor", input.strokeColor);
  formData.append("highlightColor", input.highlightColor);
  formData.append("position", input.position);
  formData.append("maxCharsPerLine", `${input.maxCharsPerLine}`);
  formData.append("maxLines", `${input.maxLines}`);
  formData.append("video", input.video);

  return apiUpload<UploadResponse>("/upload", formData);
}
