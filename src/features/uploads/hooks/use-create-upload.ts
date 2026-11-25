"use client";

import { useMutation } from "@tanstack/react-query";
import { createUpload } from "../api/create-upload";

export function useCreateUploadMutation() {
  return useMutation({
    meta: { successTitle: "Video uploaded", errorTitle: "Video could not be uploaded" },
    mutationFn: createUpload
  });
}
