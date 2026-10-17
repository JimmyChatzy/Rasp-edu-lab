// lib/serialize.ts
import { ScenarioSchema } from "@/lib/types";
import { ScenarioValues } from "@/components/renderer/types"; 

export function serializeValues(schema: ScenarioSchema, values: ScenarioValues) {
  const out: Record<string, unknown> = {};
  for (const field of schema.fields) {
    const v = values[field.name];
    if (v === undefined) continue;

    if (field.type === "media") {
      const ids = (Array.isArray(v) ? v : []).map((f) => (f as { id: number }).id);
      out[field.name] = field.multiple ? ids : (ids[0] ?? null);
    } else {
      out[field.name] = v;
    }
  }
  return out;
}

// Labels of required fields that are still empty (null, "", [] all count as empty)
export function missingRequired(schema: ScenarioSchema, values: ScenarioValues): string[] {
  return schema.fields
    .filter((f) => f.required)
    .filter((f) => {
      const v = values[f.name];
      return v == null || v === "" || (Array.isArray(v) && v.length === 0);
    })
    .map((f) => f.view?.label ?? f.name);
}