"use client";

import { useState } from "react";

import { ScenarioRenderer } from "./ScenarioRenderer";
import { ScenarioSchema } from "@/lib/types";
import { createScenarioAction } from "@/app/actions/scenarios";



interface ScenarioDesignFormProps {
  schema: ScenarioSchema;
}

type ScenarioValues = Record<
  string,
  string | number | boolean | null
>;

export function ScenarioDesignForm({
  schema,
}: ScenarioDesignFormProps) {
  const [values, setValues] = useState<ScenarioValues>({});
  const [error, setError] = useState<string | null>(null);

  function updateField(
    name: string,
    value: string | number | boolean | null
  ) {
    console.log("FIELD UPDATE:", {
      name,
      value,
      type: typeof value,
    });

    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }


async function handleSubmit(
  event: React.SubmitEvent<HTMLFormElement>
) {
  event.preventDefault();

  try {
    await createScenarioAction(values);

    // success
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      setError("Πρέπει να συνδεθείτε για να δημιουργήσετε σενάριο.");
      return;
    }

    setError("Δεν ήταν δυνατή η αποθήκευση του σεναρίου.");
  }
}

/*
  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await createScenarioAction(values);
    console.log("Scenario:", values);
  }
*/

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ERROR MESSAGE */}
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