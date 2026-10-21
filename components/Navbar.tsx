  import Link from "next/link";
  import { getSession } from "@/lib/auth";
  import { logoutAction } from "@/features/auth/auth";
  import DarkModeToggle from "./DarkModeToggle";

  export default async function Navbar() {
    const session = await getSession();
    const link = "text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white";

    return (
      <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold text-slate-800 dark:text-slate-100">Raspberry Pi Εκπαίδευση</Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard" className={link}>Τα σενάρια μου</Link>
                <span className="text-sm text-slate-500">{session.name}</span>
                <form action={logoutAction}>
                  <button type="submit" className={link}>Αποσύνδεση</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={link}>Σύνδεση</Link>
                <Link href="/register" className={link}>Εγγραφή</Link>
              </>
            )}
            <DarkModeToggle />
          </div>
        </div>
      </nav>
    );
  }

  /*

  export default async function Navbar() {
    const session = await getSession();

    return (
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Raspberry Pi Εκπαίδευση
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Αρχική
            </Link>
            <Link href="/test-schema" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              Test Schema
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

          </nav>
        </div>
      </header>
    );
  }
  */