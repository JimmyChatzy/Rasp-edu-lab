"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8 text-center">
      <p className="mb-4 text-slate-700">Κάτι πήγε στραβά.</p>
      <button onClick={reset} className="rounded bg-blue-600 px-4 py-2 text-white">Δοκιμάστε ξανά</button>
    </div>
  );
}