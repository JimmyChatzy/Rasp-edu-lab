import Link from "next/link";
import { createCommentAction } from "@/app/actions/comments";

interface CommentFormProps {
  scenarioId: string;
  isLoggedIn: boolean;
  userName?: string;
}

export default function CommentForm({
  scenarioId,
  isLoggedIn,
  userName,
}: CommentFormProps) {
  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
        <p className="mb-2">
          Για να αφήσετε σχόλιο, πρέπει να συνδεθείτε. Οι επισκέπτες μπορούν να
          δουν και να δημοσιεύσουν σενάρια, αλλά όχι να σχολιάσουν.
        </p>
        <Link href="/login" className="font-medium text-blue-700 hover:underline dark:text-blue-400">
          Σύνδεση
        </Link>
      </div>
    );
  }

  return (
    <form action={createCommentAction} className="space-y-3">
      <input type="hidden" name="scenarioId" value={scenarioId} />
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Σχολιάζετε ως <span className="font-medium dark:text-slate-200">{userName}</span>
      </p>
      <label className="block text-sm">
        <span className="mb-1 block text-slate-700 dark:text-slate-300">Σχόλιο</span>
        <textarea
          name="text"
          required
          rows={4}
          className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          placeholder="Γράψτε το σχόλιό σας..."
        />
      </label>
      <button
        type="submit"
        className="rounded bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Δημοσίευση σχολίου
      </button>
    </form>
  );
}
