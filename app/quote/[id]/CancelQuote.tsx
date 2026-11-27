"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Admin button: cancel the quote (homeowner not going ahead), behind a
// warning pop-up with Confirm / Cancel.
export default function CancelQuote({
  quoteId,
  approved,
  homeownerEmail,
}: {
  quoteId: string;
  approved: boolean;
  homeownerEmail: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notify, setNotify] = useState(true); // ticked by default; untick if they asked to cancel
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escape closes the pop-up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy]);

  const confirmCancel = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/quote/${quoteId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notify }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't cancel the quote. Please try again.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Couldn't cancel the quote. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition"
        >
          Cancel quote
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-quote-title"
            className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#111827] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xl">
                ⚠️
              </span>
              <div>
                <h2 id="cancel-quote-title" className="text-lg font-bold text-white">
                  Cancel this entire quote?
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  You&apos;re about to cancel the <strong>whole quote</strong>, including every
                  option on it. This can&apos;t be undone.
                </p>
              </div>
            </div>

            <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
              {approved && (
                <li className="text-amber-200">
                  The homeowner has already approved this quote.
                </li>
              )}
              <li>It can no longer be approved, changed, emailed or confirmed.</li>
              <li>The homeowner&apos;s approval link will stop working.</li>
              <li>It stays in the list marked &quot;Cancelled&quot; for your records.</li>
            </ul>

            <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                disabled={busy}
                className="mt-0.5 h-4 w-4"
              />
              <span className="text-sm text-white">
                Email the homeowner to let them know
                <span className="block text-xs text-slate-400 mt-0.5">
                  {homeownerEmail
                    ? `Sends a short "your quote has been cancelled" email to ${homeownerEmail}.`
                    : "No homeowner email on this quote, so nothing will be sent."}
                </span>
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                autoFocus
                className="px-5 py-2 rounded-lg text-sm font-semibold border border-white/20 bg-white/5 text-white hover:bg-white/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                disabled={busy}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-500 transition disabled:opacity-50"
              >
                {busy ? "Cancelling…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
