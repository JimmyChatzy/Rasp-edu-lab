import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <h1 className="mb-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
        Το σενάριο δεν βρέθηκε
      </h1>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Το ζητούμενο σενάριο δεν υπάρχει ή έχει αφαιρεθεί.
      </p>
      <Link href="/" className="text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
        Επιστροφή στην αρχική
      </Link>
    </div>
  );
}
