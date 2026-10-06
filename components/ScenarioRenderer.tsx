"use client";

import { useState } from "react";

import { ScenarioFieldValue } from "./renderer/types";
import { FieldRenderer } from "./renderer/FieldRenderer";
import { ScenarioSchema } from "@/lib/types";

interface ScenarioRendererProps {
  schema: ScenarioSchema;
  values?: Record<string, ScenarioFieldValue>;
  onFieldChange?: (
    name: string,
    value: ScenarioFieldValue
  ) => void;
}

function getColSpan(size?: number) {
  switch (size) {
    case 1:
      return "col-span-1";
    case 2:
      return "col-span-2";
    case 3:
      return "col-span-3";
    case 4:
      return "col-span-4";
    case 5:
      return "col-span-5";
    case 6:
      return "col-span-6";
    case 7:
      return "col-span-7";
    case 8:
      return "col-span-8";
    case 9:
      return "col-span-9";
    case 10:
      return "col-span-10";
    case 11:
      return "col-span-11";
    case 12:
      return "col-span-12";
    default:
      return "col-span-12";
  }
}

export function ScenarioRenderer({
  schema,
  values = {},
  onFieldChange,
}: ScenarioRendererProps) {
  const [activeTab, setActiveTab] = useState(
    schema.tabs[0]?.label ?? ""
  );
  console.log("SCHEMA:", schema);
console.log("ACTIVE TAB:", activeTab);
console.log("VALUES:", values);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {schema.tabs.map((tab) => {
          const isActive = tab.label === activeTab;

          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.label)}
              className={[
                "border-b-2 px-4 py-3 text-sm font-medium",
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Fields */}
      {schema.tabs.map((tab) => {
        if (tab.label !== activeTab) {
          return null;
        }

        return (
          <div
            key={tab.label}
            className="grid grid-cols-12 gap-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
          >
            {tab.fields.map((fieldName) => {
              const field = schema.fields.find(
                (item) => item.name === fieldName
              );

              if (!field) {
                return null;
              }

              return (
                <div
                  key={field.name}
                  className={getColSpan(field.view?.size)}
                >
                  <FieldRenderer
                    field={field}
                    value={values[field.name]}
                    onChange={(value) => {
                      console.log("Renderer change:", {
                        field: field.name,
                        value,
                      });

                      onFieldChange?.(
                        field.name,
                        value
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}