import Link from "next/link";
import { RegisterForm } from "@/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">Εγγραφή</h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        Δημιουργήστε λογαριασμό εκπαιδευτικού για σχόλια και πίνακα ελέγχου.
      </p>

      <RegisterForm />

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        Έχετε ήδη λογαριασμό;{" "}
        <Link href="/login" className="text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
          Σύνδεση
        </Link>
      </p>
    </div>
  );
}
