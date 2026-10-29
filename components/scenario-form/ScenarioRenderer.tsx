"use client";

import { useEffect, useMemo, useState } from "react";
import { FieldRenderer } from "./FieldRenderer";
import type { ScenarioFieldValue, ScenarioSchema, ScenarioSchemaTab } from "@/lib/types";

interface ScenarioRendererProps {
  schema: ScenarioSchema;
  values?: Record<string, ScenarioFieldValue>;
  errors?: Record<string, string>;
  jumpKey?: number;
  onFieldChange?: (name: string, value: ScenarioFieldValue) => void;
}

// Full literal class names so Tailwind can see them
const COL_SPAN: Record<number, string> = {
  1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4",
  5: "col-span-5", 6: "col-span-6", 7: "col-span-7", 8: "col-span-8",
  9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
};

const OTHER_TAB = "Άλλα πεδία";

// Visible fields that no tab lists still get rendered, so a stale tab layout can't hide (required) fields
function withLeftoverTab(schema: ScenarioSchema): ScenarioSchemaTab[] {
  const listed = new Set(schema.tabs.flatMap((t) => t.fields));
  const leftover = schema.fields
    .filter((f) => f.view?.visible !== false && !listed.has(f.name))
    .map((f) => f.name);
  return leftover.length ? [...schema.tabs, { label: OTHER_TAB, fields: leftover }] : schema.tabs;
}

export function ScenarioRenderer({ schema, values = {}, errors = {}, jumpKey = 0, onFieldChange }: ScenarioRendererProps) {
  const tabs = useMemo(() => withLeftoverTab(schema), [schema]);
  const [activeTab, setActiveTab] = useState(tabs[0]?.label ?? "");

  // Jump only when the form reports a new failed submit
  useEffect(() => {
    if (jumpKey === 0) return;
    const first = tabs.find((t) => t.fields.some((f) => errors[f]));
    if (first) setActiveTab(first.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpKey]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => {
          const isActive = tab.label === activeTab;
          const hasError = tab.fields.some((f) => errors[f]);
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.label)}
              className={[
                "border-b-2 px-4 py-3 text-sm font-medium",
                isActive ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900",
              ].join(" ")}
            >
              {tab.label}
              {hasError && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-red-500" aria-label="Σφάλμα" />}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.label}
          hidden={tab.label !== activeTab}
          className="grid grid-cols-12 gap-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 [&[hidden]]:hidden"
        >
          {tab.fields.map((fieldName) => {
            const field = schema.fields.find((item) => item.name === fieldName);
            if (!field) return null;

            return (
              <div key={field.name} className={COL_SPAN[field.view?.size ?? 12] ?? "col-span-12"}>
                <FieldRenderer
                  field={field}
                  value={values[field.name]}
                  onChange={(value) => onFieldChange?.(field.name, value)}
                />
                {errors[field.name] && <p className="mt-1 text-xs text-red-600">{errors[field.name]}</p>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
