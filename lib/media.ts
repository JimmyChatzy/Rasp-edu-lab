// lib/media.ts
// Must be a `type` alias (not an interface) so it is assignable to Record<string, unknown>.
export type StrapiFile = {
  id: number;
  documentId?: string;
  name: string;
  url: string;
  mime: string;
  size: number; // Strapi reports KB
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, { url: string }> | null;
};

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const MEDIA_BASE = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export function mediaUrl(url?: string | null): string {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `${MEDIA_BASE}${url}`;
}

export function isAllowedMime(mime: string, allowed?: string[]): boolean {
  if (!allowed || allowed.length === 0) return true;
  const kind = mime.startsWith("image/") ? "images"
    : mime.startsWith("video/") ? "videos"
    : mime.startsWith("audio/") ? "audios"
    : "files";
  return allowed.includes(kind);
}

// Value for <input accept>. `undefined` = no browser-side restriction.
export function acceptAttr(allowed?: string[]): string | undefined {
  if (!allowed?.length || allowed.includes("files")) return undefined;
  const map: Record<string, string> = { images: "image/*", videos: "video/*", audios: "audio/*" };
  return allowed.map((t) => map[t]).filter(Boolean).join(",");
}