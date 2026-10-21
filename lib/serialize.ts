import type { ScenarioFieldValue, ScenarioSchema, ScenarioValues } from "@/lib/types";
import type { FieldErrors } from "@/lib/strapi/errors";

export type ScenarioPayload = Record<string, unknown>;

// Form state → Strapi body. Media become ids; blocks pass through untouched.
export function serializeValues(schema: ScenarioSchema, values: ScenarioValues): ScenarioPayload {
  const out: ScenarioPayload = {};
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

// Strapi entry → form state (edit mode). Media always become arrays.
export function toFormValues(schema: ScenarioSchema, entry: Record<string, unknown>): ScenarioValues {
  const out: ScenarioValues = {};
  for (const f of schema.fields) {
    const v = entry[f.name];
    if (v == null) continue;
    out[f.name] =
      f.type === "media"
        ? ((Array.isArray(v) ? v : [v]) as Record<string, unknown>[])
        : (v as ScenarioFieldValue);
  }
  return out;
}

export function validateRequired(schema: ScenarioSchema, values: ScenarioValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const f of schema.fields) {
    if (!f.required) continue;
    const v = values[f.name];
    if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) {
      errors[f.name] = "Το πεδίο είναι υποχρεωτικό.";
    }
  }
  return errors;
}