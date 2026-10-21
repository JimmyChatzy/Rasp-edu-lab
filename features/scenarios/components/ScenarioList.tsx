import ScenarioCard from "./ScenarioCard";
import type { ScenarioSchemaField } from "@/lib/types";
import type { StrapiScenario } from "../api";

interface ScenarioListProps {
  scenarios: StrapiScenario[];
  fields?: ScenarioSchemaField[];
}

export default function ScenarioList({ scenarios, fields }: ScenarioListProps) {
  if (scenarios.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">Δεν υπάρχουν διαθέσιμα σενάρια.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {scenarios.map((scenario) => (
        <ScenarioCard key={scenario.documentId} scenario={scenario} fields={fields} />
      ))}
    </div>
  );
}