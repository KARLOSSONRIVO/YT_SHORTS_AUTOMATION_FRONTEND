import type { ApiErrorResponse, ApiResponse } from "@/types/api";
import { ApiError } from "./errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001/api";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

type RequestInitWithJson = RequestInit & {
  json?: unknown;
};

function normalizeApiData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeApiData(item)) as T;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const normalizedEntries = Object.entries(record)
      .filter(([key]) => key !== "__v")
      .map(([key, entryValue]) => [key, normalizeApiData(entryValue)]);

    const normalizedObject = Object.fromEntries(normalizedEntries) as Record<string, unknown>;

    if (typeof normalizedObject._id === "string" && typeof normalizedObject.id !== "string") {
      normalizedObject.id = normalizedObject._id;
    }

    return normalizedObject as T;
  }

  return value;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | ApiErrorResponse | null;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse | null;
    throw new ApiError({
      message: errorPayload?.error?.message ?? "Request failed.",
      status: response.status,
      code: errorPayload?.error?.code,
      fieldErrors:
        typeof errorPayload?.error?.details === "object" &&
        errorPayload?.error?.details !== null &&
        "fieldErrors" in errorPayload.error.details
          ? (errorPayload.error.details.fieldErrors as Record<string, string>)
          : undefined
    });
  }

  if (!payload?.success) {
    throw new ApiError({
      message: "Unexpected API response."
    });
  }

  return normalizeApiData(payload.data);
}

export async function apiRequest<T>(path: string, init: RequestInitWithJson = {}) {
  const headers = new Headers(init.headers);

  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    cache: "no-store"
  });

  return parseResponse<T>(response);
}

export async function apiUpload<T>(path: string, formData: FormData) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData
  });

  return parseResponse<T>(response);
}
