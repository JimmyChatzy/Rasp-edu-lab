"use client";

import { useRef, useState } from "react";
import { ScenarioSchemaField } from "@/lib/types";
import { ScenarioFieldValue } from "../types";
import { formatLabel } from "@/lib/utils";
import { uploadFileAction } from "@/app/actions/upload";
import { acceptAttr, isAllowedMime, mediaUrl, MAX_UPLOAD_BYTES, type StrapiFile } from "@/lib/media";

interface MediaFieldProps extends ScenarioSchemaField {
  value?: ScenarioFieldValue;
  onChange?: (value: ScenarioFieldValue) => void;
}

const MSG: Record<string, string> = {
  invalid_file: "Μη επιτρεπτός τύπος αρχείου.",
  too_large: "Το αρχείο ξεπερνά τα 10MB.",
  upload_failed: "Η μεταφόρτωση απέτυχε.",
};

export default function MediaField({
  name, required, multiple, allowedTypes, value, onChange, view,
}: MediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const files = (Array.isArray(value) ? value : []) as unknown as StrapiFile[];
  const disabled = uploading || view?.editable === false;

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const queue = multiple ? Array.from(list) : Array.from(list).slice(0, 1);

    setUploading(true);
    setErrors([]);
    const uploaded: StrapiFile[] = [];
    const problems: string[] = [];

    try {
      for (const file of queue) {
        if (!isAllowedMime(file.type, allowedTypes)) { problems.push(`${file.name}: ${MSG.invalid_file}`); continue; }
        if (file.size > MAX_UPLOAD_BYTES) { problems.push(`${file.name}: ${MSG.too_large}`); continue; }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("allowedTypes", JSON.stringify(allowedTypes ?? []));

        const result = await uploadFileAction(formData);
        if (!result.ok) {
          if (result.code === "unauthorized") {
            window.location.assign("/session-expired");
            return;
          }
          problems.push(`${file.name}: ${MSG[result.code]}`);
          continue;
        }
        uploaded.push(result.file);
      }
    } catch {
      problems.push(MSG.upload_failed);
    } finally {
      setUploading(false);
    }

    if (uploaded.length) onChange?.(multiple ? [...files, ...uploaded] : [uploaded[0]]);
    setErrors(problems);
  }

  function remove(id: number) {
    onChange?.(files.filter((f) => f.id !== id));
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {view?.label ?? formatLabel(name)}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {view?.description && <p className="mb-1 text-xs text-slate-500">{view.description}</p>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) void handleFiles(e.dataTransfer.files);
        }}
        className={`w-full rounded border-2 border-dashed px-4 py-6 text-center text-sm transition disabled:opacity-50 ${
          dragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:text-slate-300"
        }`}
      >
        {uploading
          ? "Μεταφόρτωση…"
          : multiple
            ? "Επιλέξτε αρχεία ή σύρτε τα εδώ"
            : files.length
              ? "Αντικατάσταση αρχείου (επιλογή ή σύρσιμο)"
              : "Επιλέξτε αρχείο ή σύρτε το εδώ"}
      </button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={acceptAttr(allowedTypes)}
        onChange={(e) => {
          const list = e.target.files;
          void handleFiles(list).finally(() => { e.target.value = ""; });
        }}
      />

      {errors.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-xs text-red-600">
          {errors.map((msg, i) => <li key={i}>{msg}</li>)}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((file) => (
            <li key={file.id} className="relative rounded border border-slate-200 p-2 dark:border-slate-700">
              {file.mime.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl(file.formats?.thumbnail?.url ?? file.url)}
                  alt={file.alternativeText ?? file.name}
                  className="h-24 w-full rounded object-cover"
                />
              ) : (
                <div className="flex h-24 items-center justify-center rounded bg-slate-100 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-800">
                  {file.name.split(".").pop()}
                </div>
              )}
              <a
                href={mediaUrl(file.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-xs text-slate-700 hover:underline dark:text-slate-200"
                title={file.name}
              >
                {file.name}
              </a>
              <span className="text-[11px] text-slate-400">{file.size.toFixed(0)} KB</span>
              {view?.editable !== false && (
                <button
                  type="button"
                  aria-label="Αφαίρεση"
                  title="Αφαίρεση"
                  onClick={() => remove(file.id)}
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-sm leading-5 text-red-600 shadow hover:bg-white"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}