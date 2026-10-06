"use client";

import Link from "next/link";
import { useState } from "react";
import RichTextEditor from "./renderer/fields/RichTextEditor";
import type { ScenarioFieldConfig, ScenarioFieldTab } from "@/lib/strapi";

interface ScenarioFormProps {
  isLoggedIn: boolean;
  action: (formData: FormData) => Promise<void>;
  fields: ScenarioFieldConfig[];
}

const TABS: { id: ScenarioFieldTab; label: string }[] = [
  { id: "basic", label: "Βασικά Στοιχεία" },
  { id: "teaching", label: "Διδακτικός Σχεδιασμός" },
  { id: "media", label: "Πολυμέσα & Δημοσίευση" },
];

const inputClass =
  "w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";
const labelClass = "mb-1 block text-slate-700 dark:text-slate-300";

function FieldLabel({ field }: { field: ScenarioFieldConfig }) {
  return <span className={labelClass}>{field.label}</span>;
}

function renderField(field: ScenarioFieldConfig) {
  switch (field.type) {
    case "richText":
      return (
        <RichTextEditor
          name={field.name}
          minHeight={field.minHeight ?? "120px"}
          placeholder={field.placeholder ?? ""}
        />
      );
    case "textarea":
      return (
        <textarea
          name={field.name}
          // required={field.required}
          rows={3}
          className={inputClass}
          placeholder={field.placeholder ?? ""}
        />
      );
    case "select":
      return (
        <select
          name={field.name}
          // required={field.required}
          className={inputClass}
          defaultValue={field.defaultValue ?? ""}
        >
          {!field.required && <option value="">—</option>}
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case "number":
      return (
        <input
          name={field.name}
          // required={field.required}
          type="number"
          // min={field.min ?? undefined}
          //max={field.max ?? undefined}
          //step={field.step ?? undefined}
          // defaultValue={field.defaultValue ?? undefined}
          className={inputClass}
        />
      );
    case "url":
      return (
        <input
          name={field.name}
          // required={field.required}
          type="url"
          placeholder={field.placeholder ?? ""}
          className={inputClass}
        />
      );
    case "file":
      return (
        <>
          <input
            name={field.name}
            type="file"
            accept={field.accept ?? undefined}
            multiple={field.multiple ?? false}
            className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200`}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Μπορείτε να επιλέξετε πολλές εικόνες. Θα μετατραπούν αυτόματα σε μορφή base64.
          </p>
        </>
      );
    case "text":
    default:
      return (
        <input
          name={field.name}
          //  required={field.required}
          type="text"
          placeholder={field.placeholder ?? ""}
          className={inputClass}
        />
      );
  }
}


export default function ScenarioForm({ isLoggedIn, action, fields }: ScenarioFormProps) {
  const [activeTab, setActiveTab] = useState<ScenarioFieldTab>("basic");
  const [error, setError] = useState("");

  // Group fields by tab, preserving order
  const fieldsByTab = TABS.map((tab) => ({
    ...tab,
    fields: fields.filter((field) => field.tab === tab.id),
  }));

  // Debugger     //////
  console.log(
    fieldsByTab.map((tab) => ({
      tab: tab.id,
      fields: tab.fields.map((field) => ({
        name: field.name,
        type: field.type,
      })),
    }))
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);



    const richInputs = form.querySelectorAll('input[type="hidden"]');

    console.log(
      "HIDDEN INPUTS:",
      Array.from(richInputs).map((input) => ({
        name: (input as HTMLInputElement).name,
        value: (input as HTMLInputElement).value,
      }))
    );

    // Validate required rich text fields (hidden inputs can't use `required`)
    for (const field of fields) {
      if (!field.required) continue;  //|| field.type !== "richText") continue;
      const value = String(formData.get(field.name) || "").trim();
      if (!value || value === "<p></p>" || value === "<p><br></p>") {
        event.preventDefault();
        setError(`Το πεδίο "${field.label.replace(" *", "")}" είναι υποχρεωτικό.`);
        return;
      }
    }

    setError("");
  }

  return (
    <form
      action={action}
      onSubmit={function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.currentTarget;

        console.log("=== ALL RICH TEXT INPUTS ===");

        const inputs = form.querySelectorAll(
          'input[type="hidden"]'
        );

        inputs.forEach((input) => {
          const el = input as HTMLInputElement;

          console.log(
            "name:",
            el.name,
            "| value:",
            el.value
          );
        });
      }}
      className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
    >
      {/* Tab navigation */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-slate-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
              ? "bg-blue-700 text-white dark:bg-blue-600"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {fieldsByTab.map((tab) => (
        <div key={tab.id} className={activeTab === tab.id ? "space-y-4" : "hidden"}>
          {tab.fields
            .filter((field) => !(field.name === "authorName" && isLoggedIn))
            .map((field) => (
              <label key={field.name} className="block text-sm">
                <FieldLabel field={field} />
                {renderField(field)}
              </label>
            ))}

          {error && (
            <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </p>
          )}
          {tab.id === "media" && (
            <>

              <div className="flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                <button
                  type="submit"
                  className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Δημοσίευση
                </button>
                <Link
                  href="/"
                  className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Ακύρωση
                </Link>
              </div>
            </>
          )}
        </div>
      ))}
    </form>
  );
}