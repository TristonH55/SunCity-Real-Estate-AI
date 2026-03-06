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
      className={`px-3 py-1 rounded text-white text-xs ${
        approved ? "bg-red-600" : "bg-green-600"
      }`}
    >
      {approved ? "Reject" : "Approve"}
    </button>
  );
}