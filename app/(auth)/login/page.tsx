import Link from "next/link";
import { LoginForm } from "@/features/auth/LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  return (
    <div className="mx-auto max-w-md">
       <h1 className="mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">Σύνδεση</h1>
       <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        Συνδεθείτε για να σχολιάσετε σενάρια και να διαχειριστείτε τις
        δημοσιεύσεις σας.
       </p>

      <LoginForm notice={reason === "expired" ? "Η συνεδρία σας έληξε. Συνδεθείτε ξανά." : undefined} />
      
      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        Δεν έχετε λογαριασμό;{" "}
        <Link href="/register" className="text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
          Εγγραφή
        </Link>
      </p>
    </div>
  );
}