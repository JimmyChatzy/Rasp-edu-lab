"use client";

import { useMemo, useState } from "react";
import type { TeachingScenario } from "@/lib/types";
import ScenarioCard from "./ScenarioCard";

const GRADE_LEVELS = ["Α", "Β", "Γ", "Δ", "Ε", "ΣΤ"] as const;

interface ScenarioListWithFiltersProps {
  scenarios: TeachingScenario[];
}

export default function ScenarioListWithFilters({
  scenarios,
}: ScenarioListWithFiltersProps) {
  const [gradeLevel, setGradeLevel] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [subject, setSubject] = useState("");

  const allSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    scenarios.forEach((scenario) => {
      scenario.subjects.forEach((item) => subjectSet.add(item));
    });
    return Array.from(subjectSet).sort();
  }, [scenarios]);

  const filtered = useMemo(() => {
    return scenarios.filter((scenario) => {
      if (gradeLevel && scenario.gradeLevel !== gradeLevel) {
        return false;
      }
      if (difficulty && scenario.difficulty !== Number(difficulty)) {
        return false;
      }
      if (subject && !scenario.subjects.includes(subject)) {
        return false;
      }
      return true;
    });
  }, [scenarios, gradeLevel, difficulty, subject]);

  return (
    <div>
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Φίλτρα</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600 dark:text-slate-400">Τάξη</span>
            <select
              value={gradeLevel}
              onChange={(event) => setGradeLevel(event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">Όλες</option>
              {GRADE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600 dark:text-slate-400">Δυσκολία</span>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">Όλες</option>
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600 dark:text-slate-400">Μάθημα</span>
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">Όλα</option>
              {allSubjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        {filtered.length} σενάρια βρέθηκαν
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Δεν βρέθηκαν σενάρια με τα επιλεγμένα φίλτρα.
        </p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
}
