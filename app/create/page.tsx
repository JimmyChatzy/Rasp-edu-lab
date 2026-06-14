import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createScenarioAction } from "@/app/actions/scenarios";

const GRADE_LEVELS = ["Α", "Β", "Γ", "Δ", "Ε", "ΣΤ"] as const;

export default async function CreatePage() {
  const session = await getSession();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
        Δημιουργία Σεναρίου
      </h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        Μοιραστείτε μια διδακτική ιδέα για έργα Raspberry Pi. Οι επισκέπτες
        μπορούν να δημοσιεύσουν χωρίς λογαριασμό.
      </p>

      <form
        action={createScenarioAction}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
      >
        {!session && (
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700 dark:text-slate-300">Όνομα (προαιρετικό)</span>
            <input
              name="authorName"
              type="text"
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              placeholder="π.χ. Μαρία Π."
            />
          </label>
        )}

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">Τίτλος *</span>
          <input
            name="title"
            required
            type="text"
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">Περιγραφή *</span>
          <textarea
            name="description"
            required
            rows={3}
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700 dark:text-slate-300">Τάξη *</span>
            <select
              name="gradeLevel"
              required
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              defaultValue="Ε"
            >
              {GRADE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-700 dark:text-slate-300">Διάρκεια (λεπτά) *</span>
            <input
              name="duration"
              required
              type="number"
              min={15}
              step={15}
              defaultValue={60}
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-700 dark:text-slate-300">Δυσκολία (1–5) *</span>
            <select
              name="difficulty"
              required
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              defaultValue={2}
            >
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">
            Μαθήματα (διαχωρισμένα με κόμμα) *
          </span>
          <input
            name="subjects"
            required
            type="text"
            placeholder="Πληροφορική, Φυσική"
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">Εξοπλισμός *</span>
          <textarea
            name="equipment"
            required
            rows={2}
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">
            Σύνδεση με πρόγραμμα σπουδών *
          </span>
          <textarea
            name="curriculumConnection"
            required
            rows={2}
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">Ιδέα *</span>
          <textarea
            name="idea"
            required
            rows={3}
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">Περιεχόμενο / Βήματα *</span>
          <textarea
            name="content"
            required
            rows={6}
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">Εικόνες (προαιρετικό)</span>
          <input
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Μπορείτε να επιλέξετε πολλές εικόνες. Θα μετατραπούν αυτόματα σε μορφή base64.
          </p>
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Δημοσίευση
          </button>
          <Link
            href="/"
            className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Ακύρωση
          </Link>
        </div>
      </form>
    </div>
  );
}
