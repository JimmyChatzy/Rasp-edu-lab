"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScenarioRenderer } from "@/components/scenario-form/ScenarioRenderer";
import type { ScenarioFieldValue, ScenarioSchema, ScenarioValues } from "@/lib/types";
import type { FieldErrors } from "@/lib/strapi/errors";
import { serializeValues, validateRequired } from "@/lib/serialize";
import { createScenarioAction, updateScenarioAction } from "../actions";

interface ScenarioFormProps {
  schema: ScenarioSchema;
  documentId?: string;          // present = edit mode
  initialValues?: ScenarioValues;
}

export function ScenarioForm({ schema, documentId, initialValues = {} }: ScenarioFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ScenarioValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [jumpKey, setJumpKey] = useState(0);   // bumps on each failed submit → renderer jumps to the first tab with an error
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);            // blocks double submits

  const updateField = useCallback((name: string, value: ScenarioFieldValue) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  function fail(message: string, errors: FieldErrors = {}) {
    setError(message);
    setFieldErrors(errors);
    setJumpKey((k) => k + 1);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    setError(null);
    setFieldErrors({});

    const clientErrors = validateRequired(schema, values);
    if (Object.keys(clientErrors).length > 0) {
      fail("Συμπληρώστε τα υποχρεωτικά πεδία.", clientErrors);
      return;
    }

    submitting.current = true;
    setPending(true);
    let navigating = false;

    try {
      const payload = serializeValues(schema, values);
      const result = documentId
        ? await updateScenarioAction(documentId, payload)
        : await createScenarioAction(payload);

      if (result.ok) {
        navigating = true;                 // keep the button locked until the page changes
        router.push("/dashboard");
        router.refresh();
        return;
      }

      switch (result.code) {
        case "unauthorized":
          navigating = true;
          window.location.assign("/session-expired"); // full navigation so the route handler runs
          return;
        case "validation":
          fail(result.message ?? "Ελέγξτε τα πεδία της φόρμας.", result.fieldErrors);
          break;
        case "forbidden":
          fail("Δεν έχετε δικαίωμα για αυτή την ενέργεια.");
          break;
        default:
          fail("Δεν ήταν δυνατή η αποθήκευση του σεναρίου.");
      }
    } catch (e) {
      console.error(e);
      fail("Παρουσιάστηκε απρόσμενο σφάλμα. Δοκιμάστε ξανά.");
    } finally {
      if (!navigating) {
        submitting.current = false;
        setPending(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ScenarioRenderer
        schema={schema}
        values={values}
        errors={fieldErrors}
        jumpKey={jumpKey}
        onFieldChange={updateField}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Αποθήκευση…" : "Αποθήκευση"}
        </button>
      </div>
    </form>
  );
}

/*
"use client";

import { useState } from "react";

import { ScenarioRenderer } from "../../../components/scenario-form/ScenarioRenderer";
import { ScenarioSchema } from "@/lib/types";
import { createScenarioAction } from "@/features/scenarios/actions";
import type {ScenarioFieldValue, ScenarioValues} from "@/components/scenario-form/types"
import { serializeValues, missingRequired } from "@/lib/serialize"

interface ScenarioDesignFormProps {
  schema: ScenarioSchema;
}

export function ScenarioDesignForm({
  schema,
}: ScenarioDesignFormProps) {
  const [values, setValues] = useState<ScenarioValues>({});
  const [error, setError] = useState<string | null>(null);

  function updateField(
    name: string,
    value: ScenarioFieldValue
  ) {

    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }


async function handleSubmit(
  event: React.SubmitEvent<HTMLFormElement>
) {
  event.preventDefault();
  setError (null);
 
  const result = await createScenarioAction(values);
  if (result.ok) return; // success handling / redirect

 if (result.code === "unauthorized") {
    window.location.assign("/session-expired"); // full navigation so the route handler runs
    return;
  }
  setError(result.code === "validation" ? (result.message ?? "Ελέγξτε τα πεδία της φόρμας.") : "Δεν ήταν δυνατή η αποθήκευση του σεναρίου.");
 
  const missing = missingRequired(schema, values);

  if (missing.length) {
    setError(`Συμπληρώστε τα υποχρεωτικά πεδία: ${missing.join(", ")}`);
    return;
  }

  const result = await createScenarioAction(serializeValues(schema, values));
}


  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
      )}

      <ScenarioRenderer
        schema={schema}
        values={values}
        onFieldChange={updateField}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Αποθήκευση
        </button>
      </div>
    </form>
  );
}
*/