import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import DarkModeToggle from "./DarkModeToggle";

export default async function Navbar() {
  const session = await getSession();

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Raspberry Pi Εκπαίδευση
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Αρχική
          </Link>
          <Link href="/create" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Νέο Σενάριο
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Πίνακας Ελέγχου
              </Link>
              <span className="text-slate-500 dark:text-slate-400">Γεια, {session.name}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Αποσύνδεση
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Σύνδεση
              </Link>
              <Link
                href="/register"
                className="rounded bg-blue-700 px-3 py-1.5 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Εγγραφή
              </Link>
            </>
          )}
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}
