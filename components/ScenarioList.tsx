import ScenarioCard from "./ScenarioCard";

interface Scenario {
  documentId: string;
  title?: string;
  difficulty?: string;
  duration?: number | null;
  author?: {
    documentId?: string;
    username?: string;
  };
  createdAt?: string;
}

interface ScenarioListProps {
  scenarios: Scenario[];
}

export default function ScenarioList({
  scenarios,
}: ScenarioListProps) {
  if (scenarios.length === 0) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Δεν υπάρχουν διαθέσιμα σενάρια.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {scenarios.map((scenario) => (
        <ScenarioCard
          key={scenario.documentId}
          scenario={scenario}
        />
      ))}
    </div>
  );
}