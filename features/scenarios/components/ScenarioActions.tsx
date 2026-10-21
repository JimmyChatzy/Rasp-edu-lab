"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteScenarioAction, submitScenarioAction, type ActionResult } from "../actions";
import type { ReviewStatus } from "../api";

export const STATUS_LABEL: Record<ReviewStatus, string> = {
  draft: "Πρόχειρο",
  pending_review: "Σε αναμονή έγκρισης",
  published: "Δημοσιευμένο",
  rejected: "Απορρίφθηκε",
};

export function ScenarioActions({ documentId, status }: { documentId: string; status: ReviewStatus }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<ActionResult>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await fn();
      if (result.ok) {
        setConfirming(false);
        router.refresh();
      } else if (result.code === "unauthorized") {
        window.location.assign("/session-expired");
        return;
      } else if (result.code === "forbidden") {
        setError("Δεν έχετε δικαίωμα για αυτή την ενέργεια.");
      } else {
        setError(result.message ?? "Η ενέργεια απέτυχε. Δοκιμάστε ξανά.");
      }
    } catch {
      setError("Παρουσιάστηκε απρόσμενο σφάλμα.");
    }
    setBusy(false);
  }

  const canSubmit = status === "draft" || status === "rejected";
  const btn = "rounded border px-3 py-1 text-xs disabled:opacity-50";

  return (
    <div className="flex flex-col items-end gap-1">
      {confirming ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-700 dark:text-slate-200">Είστε σίγουροι;</span>
          <button type="button" disabled={busy} onClick={() => run(() => deleteScenarioAction(documentId))}
            className={`${btn} border-red-600 bg-red-600 text-white`}>
            {busy ? "…" : "Ναι, διαγραφή"}
          </button>
          <button type="button" disabled={busy} onClick={() => setConfirming(false)}
            className={`${btn} border-slate-300 text-slate-700`}>
            Άκυρο
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Link href={`/scenarios/${documentId}/edit`} className={`${btn} border-slate-300 text-slate-700 hover:bg-slate-100`}>
            Επεξεργασία
          </Link>
          {canSubmit && (
            <button type="button" disabled={busy} onClick={() => run(() => submitScenarioAction(documentId))}
              className={`${btn} border-blue-600 text-blue-700 hover:bg-blue-50`}>
              Υποβολή για δημοσίευση
            </button>
          )}
          <button type="button" onClick={() => setConfirming(true)}
            className={`${btn} border-red-300 text-red-600 hover:bg-red-50`}>
            Διαγραφή
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}