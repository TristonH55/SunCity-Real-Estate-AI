"use client";

import { useState } from "react";

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
      className={`px-3 py-1 rounded-md text-white text-xs font-medium transition hover:brightness-110 disabled:opacity-50 ${
        approved ? "bg-[#db231f]" : "bg-emerald-500"
      }`}
    >
      {approved ? "Reject" : "Approve"}
    </button>
  );
}