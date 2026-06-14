import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">Εγγραφή</h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        Δημιουργήστε λογαριασμό εκπαιδευτικού για σχόλια και πίνακα ελέγχου.
      </p>

      <form
        action={registerAction}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
      >
        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">Όνομα</span>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-700 dark:text-slate-300">Κωδικός πρόσβασης</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Εγγραφή
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        Έχετε ήδη λογαριασμό;{" "}
        <Link href="/login" className="text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
          Σύνδεση
        </Link>
      </p>
    </div>
  );
}
