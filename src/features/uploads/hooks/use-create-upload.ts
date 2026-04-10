"use client";

import { useMutation } from "@tanstack/react-query";
import { createUpload } from "../api/create-upload";

export function useCreateUploadMutation() {
  return useMutation({
    mutationFn: createUpload
  });
}
