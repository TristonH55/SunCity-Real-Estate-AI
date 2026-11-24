"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Admin button that takes an option off the quote, e.g. a brand added by mistake.
export default function RemoveOption({
  quoteId,
  optionId,
  name,
  approved,
}: {
  quoteId: string;
  optionId: string;
  name: string;
  approved: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    const warning = approved
      ? `Remove ${name} from this quote? The homeowner has approved it, so this clears their approval.`
      : `Remove ${name} from this quote?`;
    if (!confirm(warning)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/quote/${quoteId}/change-brand`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Couldn't remove it. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      alert("Couldn't remove it. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
    >
      {busy ? "Removing…" : "Remove"}
    </button>
  );
}
