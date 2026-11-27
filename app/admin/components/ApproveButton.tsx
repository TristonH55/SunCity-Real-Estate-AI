"use client";

import { useState } from "react";
import AdminIcon from "./AdminIcon";

export default function ApproveButton({
  userId,
  approved,
}: {
  userId: string;
  approved: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);

    await fetch("/api/admin/users/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        approved: !approved,
      }),
    });

    location.reload();
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition disabled:opacity-50 ${
        approved
          ? "bg-red-900/40 border-red-500/50 text-red-100 hover:bg-red-800/50"
          : "bg-emerald-600/30 border-emerald-400/50 text-emerald-100 hover:bg-emerald-600/45"
      }`}
    >
      <AdminIcon name={approved ? "x" : "check"} size={14} className={approved ? "text-red-400" : "text-emerald-300"} />
      {approved ? "Reject" : "Approve"}
    </button>
  );
}