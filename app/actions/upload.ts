"use server";

import { getSession } from "@/lib/auth";
import { isAllowedMime, MAX_UPLOAD_BYTES, type StrapiFile } from "@/lib/media";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const IMAGE_MAX = 5 * 1024 * 1024;

export type UploadResult =
  | { ok: true; file: StrapiFile }
  | { ok: false; code: "unauthorized" | "invalid_file" | "too_large" | "upload_failed" };

async function sendToStrapi(file: File): Promise<UploadResult> {
  const session = await getSession();
  if (!session?.jwt) return { ok: false, code: "unauthorized" };

  const body = new FormData();
  body.append("files", file);

  try {
    const res = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.jwt}` }, // no Content-Type: fetch sets the boundary
      body,
    });
    if (res.status === 401) return { ok: false, code: "unauthorized" };
    if (!res.ok) return { ok: false, code: "upload_failed" };

    const data = await res.json();
    return { ok: true, file: data[0] as StrapiFile };
  } catch {
    return { ok: false, code: "upload_failed" };
  }
}

export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return { ok: false, code: "invalid_file" };
  if (file.size > IMAGE_MAX) return { ok: false, code: "too_large" };
  return sendToStrapi(file);
}

export async function uploadFileAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, code: "invalid_file" };

  let allowed: string[] = [];
  try {
    allowed = JSON.parse(String(formData.get("allowedTypes") ?? "[]"));
  } catch {
    /* treat as unrestricted */
  }

  if (!isAllowedMime(file.type, allowed)) return { ok: false, code: "invalid_file" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, code: "too_large" };
  return sendToStrapi(file);
}